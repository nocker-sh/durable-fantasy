import { afterEach, expect, it, vi } from "vitest"
import { Wild } from "#/durable-objects/wild"
import { Player } from "#/durable-objects/player"
import { emptyWild } from "#/world/core/wild/empty-wild"
import { hit } from "#/world/core/wild/hit"
import { MONSTER_KINDS, SPAWNS } from "#/world/core/monsters"
import type { SkillId } from "#/world/core/skill-types"
import { player } from "#/world/test/player"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
const spawn = SPAWNS.find((s) => s.kind === "slime")!
const fullHp = MONSTER_KINDS[spawn.kind].hp
const fighter = () => {
  const base = player()
  return player({ stats: { ...base.stats, str: 8 }, equipment: { ...base.equipment, weapon: "short-sword" }, sp: 20, spAt: Date.now() })
}
async function fixture() {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const makeStore = () => durableStorage({ player: fighter(), credential: null, location: null, trade: null, tradeJob: null, exchangeReceipt: null, orderEscrow: null }, 4)
  const recipientStore = makeStore()
  const sourceStore = durableStorage({ wild: emptyWild() }, 0)
  let recipient = new Player.class(recipientStore.state, {})
  let source = new Wild.class(sourceStore.state, {})
  const others = new Map<string, { store: ReturnType<typeof makeStore>; actor: typeof recipient }>()
  await recipient.read()
  await source.state(spawn.map)
  let loseReply = false
  const pay = vi.fn(async (input: Parameters<typeof recipient.payStrike>[0]) => {
    const result = await recipient.payStrike(input)
    if (loseReply) {
      loseReply = false
      throw Error("Response lost")
    }
    return result
  })
  const hunter = {
    payStrike: pay,
    receiveCombat: (source: string, delivery: Parameters<typeof recipient.receiveCombat>[1]) => recipient.receiveCombat(source, delivery),
    read: () => recipient.read(),
    readCombat: () => recipient.readCombat(),
  }
  vi.spyOn(Player, "get").mockImplementation((owner: unknown) => {
    if (typeof owner !== "string") throw Error("Expected a player name")
    if (owner === "hunter") return hunter as unknown as ReturnType<typeof Player.get>
    let other = others.get(owner)
    if (!other) {
      const store = makeStore()
      other = { store, actor: new Player.class(store.state, {}) }
      others.set(owner, other)
    }
    return other.actor as unknown as ReturnType<typeof Player.get>
  })
  return {
    sourceStore,
    recipientStore,
    pay,
    get source() {
      return source
    },
    get recipient() {
      return recipient
    },
    loseNextReply: () => {
      loseReply = true
    },
    restart: () => {
      source = new Wild.class(sourceStore.state, {})
      recipient = new Player.class(recipientStore.state, {})
      for (const other of others.values()) other.actor = new Player.class(other.store.state, {})
    },
    begin: async (request = "request", damage = 1, owner = "hunter", art: SkillId | undefined = "lunge", target = spawn.id) => {
      const result = await source.beginStrike({ target: target, damage: damage, owner: owner, request: request, art: art })
      if (!result.ok) throw Error(result.reason)
      return result.id
    },
  }
}
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

it("reserves a target before payment, including while payment is delayed", async () => {
  const f = await fixture()
  const id = await f.begin()
  const pay = f.pay.getMockImplementation()!
  let release!: () => void
  let entered!: () => void
  const paying = new Promise<void>((resolve) => {
    entered = resolve
  })
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  f.pay.mockImplementation(async (...args) => {
    entered()
    await gate
    return pay(...args)
  })
  const first = f.source.strike("hunter", id)
  await paying
  const second = f.source.beginStrike({ target: spawn.id, damage: 1, owner: "other", request: "other-request", art: "lunge" })
  release()
  const [accepted, rejected] = await Promise.all([first, second])
  expect(accepted.refused).toBe(false)
  expect(accepted.payment?.ok && accepted.payment.state.sp).toBe(16)
  expect(rejected).toEqual({ ok: false, reason: "TAKEN" })
  expect(f.pay).toHaveBeenCalledOnce()
  f.restart()
  expect((await f.source.state(spawn.map))[spawn.id].hp).toBe(fullHp - 1)
})

it.each(["reply", "source-save", "payment-save"])("recovers %s across restart, applying one debit and one hit", async (failure) => {
  const f = await fixture()
  const id = await f.begin()
  if (failure === "reply") f.loseNextReply()
  if (failure === "source-save") f.sourceStore.failNextSave()
  if (failure === "payment-save") f.recipientStore.failNextSave()
  await expect(f.source.strike("hunter", id)).rejects.toThrow()
  f.restart()
  await f.source.alarm()
  expect((await f.source.state(spawn.map))[spawn.id].hp).toBe(fullHp - 1)
  expect((await f.recipient.read()).sp).toBe(16)
  await f.source.alarm()
  const replay = await f.source.strike("hunter", id)
  expect(replay.refused).toBe(false)
  expect(replay.payment?.ok && replay.payment.events).toEqual([])
  expect((await f.recipient.read()).sp).toBe(16)
  expect((await f.source.state(spawn.map))[spawn.id].hp).toBe(fullHp - 1)
})

it("does not charge or hit when saving the intent fails", async () => {
  const f = await fixture()
  f.sourceStore.failNextSave()
  await expect(f.begin()).rejects.toThrow("Storage unavailable")
  f.restart()
  await f.source.alarm()
  expect(f.pay).not.toHaveBeenCalled()
  expect((await f.recipient.read()).sp).toBe(20)
  expect((await f.source.state(spawn.map))[spawn.id].hp).toBe(fullHp)
})

it("recovers a paid blow if the alarm's final save fails", async () => {
  const f = await fixture()
  await f.begin()
  f.sourceStore.failNextSave()
  await expect(f.source.alarm()).rejects.toThrow("Storage unavailable")
  f.restart()
  await f.source.alarm()
  expect((await f.recipient.read()).sp).toBe(16)
  expect((await f.source.state(spawn.map))[spawn.id].hp).toBe(fullHp - 1)
})

it("does not pay for a defeated target after restart", async () => {
  const f = await fixture()
  const request = await f.source.beginStrike({ target: spawn.id, damage: fullHp, owner: "hunter", request: "normal" })
  if (!request.ok) throw Error(request.reason)
  expect((await f.source.strike("hunter", request.id)).beaten).toBe(true)
  f.restart()
  f.pay.mockClear()
  for (const owner of ["hunter", "other"]) {
    expect(await f.source.beginStrike({ target: spawn.id, damage: 20, owner: owner, request: "later", art: "lunge" })).toEqual({ ok: false, reason: "TARGET_GONE" })
  }
  expect(f.pay).not.toHaveBeenCalled()
})

it("persists a payment refusal without damaging or claiming the target", async () => {
  const f = await fixture()
  f.pay.mockResolvedValue({ ok: false, reason: "SP_SHORT" })
  const id = await f.begin("request", 20)
  expect(await f.source.strike("hunter", id)).toMatchObject({ refused: true, reason: "SP_SHORT", hp: fullHp })
  const next = await f.source.beginStrike({ target: spawn.id, damage: 0, owner: "other", request: "normal" })
  if (!next.ok) throw Error(next.reason)
  expect((await f.source.strike("other", next.id)).hp).toBe(fullHp)
  expect(await f.source.beginStrike({ target: spawn.id, damage: 1, owner: "hunter", request: "later" })).toEqual({ ok: false, reason: "TAKEN" })
})

it("does not overwrite other targets while recovering an earlier reserved blow", async () => {
  const f = await fixture()
  const other = SPAWNS.find((s) => s.id !== spawn.id && s.kind === "slime")!
  const first = await f.begin()
  const next = await f.source.beginStrike({ target: other.id, damage: 2, owner: "other", request: "normal" })
  if (!next.ok) throw Error(next.reason)
  await f.source.strike("other", next.id)
  f.restart()
  await f.source.alarm()
  expect((await f.source.state(spawn.map))[spawn.id].hp).toBe(fullHp - 1)
  expect((await f.source.state(other.map))[other.id].hp).toBe(fullHp - 2)
  expect((await f.source.strike("hunter", first)).refused).toBe(false)
})

it("does not replace pending requests or accept altered, invalid or stale IDs", async () => {
  const f = await fixture()
  const id = await f.begin()
  expect(await f.begin()).toBe(id)
  expect(await f.source.beginStrike({ target: spawn.id, damage: 2, owner: "hunter", request: "request", art: "lunge" })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(await f.source.beginStrike({ target: spawn.id, damage: 1, owner: "hunter", request: "next", art: "lunge" })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(await f.source.strike("hunter", id + 1)).toMatchObject({ refused: true, reason: "NOT_READY" })
  for (const damage of [-1, NaN, Infinity, 1.5]) {
    expect(await f.source.beginStrike({ target: spawn.id, damage: damage, owner: "other", request: "bad" })).toEqual({ ok: false, reason: "NOT_READY" })
  }
  expect(f.pay).not.toHaveBeenCalled()
})

it("preserves existing creatures, ownership and recovery times when migrating the wild envelope", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const other = SPAWNS.find((s) => s.id !== spawn.id && s.kind === "slime")!
  const fighting = hit({ state: emptyWild(), id: spawn.id, damage: 1, now: 900, player: "hunter" }).state
  const saved = hit({ state: fighting, id: other.id, damage: fullHp, now: 950, player: "other" }).state
  const store = durableStorage({ wild: saved }, 0)
  const wild = new Wild.class(store.state, {})
  await wild.state(spawn.map)
  expect(store.saved.get("__void_durable_state")).toEqual({ __voidDurableState: true, version: 3, value: { revision: 0, wild: saved, serial: 0, jobs: {}, deliverySerial: 0, deliveries: {} } })
  expect(await wild.beginStrike({ target: spawn.id, damage: 1, owner: "other", request: "new" })).toEqual({ ok: false, reason: "TAKEN" })
  expect(await wild.beginStrike({ target: other.id, damage: 1, owner: "hunter", request: "new" })).toEqual({ ok: false, reason: "TARGET_GONE" })
})

it("recovers a healthy target even when another hunter's payment stays unavailable", async () => {
  const f = await fixture()
  const other = SPAWNS.find((s) => s.id !== spawn.id && s.kind === "slime")!
  await f.begin()
  f.pay.mockRejectedValue(Error("Player unavailable"))
  const normal = await f.source.beginStrike({ target: other.id, damage: 2, owner: "other", request: "normal" })
  if (!normal.ok) throw Error(normal.reason)
  await f.source.alarm()
  expect((await f.source.state(spawn.map))[spawn.id].hp).toBe(fullHp)
  expect((await f.source.state(other.map))[other.id].hp).toBe(fullHp - 2)
  expect(f.sourceStore.alarms).toHaveBeenCalled()
  f.restart()
  expect(await f.source.beginStrike({ target: spawn.id, damage: 1, owner: "another", request: "new" })).toEqual({ ok: false, reason: "TAKEN" })
  expect((await f.source.strike("other", normal.id)).refused).toBe(false)
})

it.each(["pending", "done"] as const)("preserves a pre-delivery %s job through migration without repeating its payment or completed rewards", async (phase) => {
  const f = await fixture()
  const intent = { id: 7, request: "legacy", target: spawn.id, damage: 1, owner: "hunter", art: "lunge", at: 1000 }
  const result = { hp: fullHp - 1, back: 0, beaten: false, refused: false }
  const value = {
    wild: phase === "done" ? hit({ state: emptyWild(), id: spawn.id, damage: 1, now: 1000, player: "hunter" }).state : emptyWild(),
    serial: 7,
    jobs: { hunter: phase === "done" ? { ...intent, phase, result } : { ...intent, phase } },
  }
  expect((await f.recipient.payStrike({ source: "test-object", id: 7, art: "lunge" })).ok).toBe(true)
  f.sourceStore.saved.set("__void_durable_state", { __voidDurableState: true, version: 1, value: structuredClone(value) })
  f.restart()
  await f.source.state(spawn.map)
  expect(f.sourceStore.saved.get("__void_durable_state")).toEqual({ __voidDurableState: true, version: 3, value: { ...value, revision: 0, deliverySerial: 0, deliveries: {} } })
  await f.source.alarm()
  expect((await f.recipient.read()).sp).toBe(16)
  expect((await f.source.state(spawn.map))[spawn.id].hp).toBe(fullHp - 1)
  expect(f.pay).toHaveBeenCalledTimes(phase === "pending" ? 1 : 0)
  if (phase === "done") expect(f.sourceStore.saved.get("__void_durable_state")).toEqual({ __voidDurableState: true, version: 3, value: { ...value, revision: 0, deliverySerial: 0, deliveries: {} } })
})

it.each([undefined, "lunge"] as const)("does not accept an unpaid %s attack from before revival, including after losing its refusal reply", async (art) => {
  const f = await fixture()
  const request = await f.source.beginStrike({ target: spawn.id, damage: 1, owner: "hunter", request: "before-fall", art: art })
  if (!request.ok) throw Error(request.reason)
  expect((await f.recipient.run({ type: "hurt", amount: 10000, by: "スライム" })).ok).toBe(true)
  expect((await f.recipient.run({ type: "revive" })).ok).toBe(true)
  const before = await f.recipient.read()
  f.loseNextReply()
  await expect(f.source.strike("hunter", request.id)).rejects.toThrow("Response lost")
  f.restart()
  await f.source.alarm()
  expect(await f.source.strike("hunter", request.id)).toMatchObject({ refused: true, reason: "NOT_READY" })
  expect((await f.recipient.read()).sp).toBe(before.sp)
  expect((await f.source.state(spawn.map))[spawn.id].hp).toBe(fullHp)
  const next = await f.source.beginStrike({ target: spawn.id, damage: 1, owner: "hunter", request: "after-revival", art: art })
  if (!next.ok) throw Error(next.reason)
  expect((await f.source.strike("hunter", next.id)).refused).toBe(false)
  expect((await f.recipient.read()).sp).toBe(before.sp - (art ? 4 : 0))
})

it.each([undefined, "lunge"] as const)("finishes an already accepted %s blow after revival without paying or retaliating again", async (art) => {
  const f = await fixture()
  const request = await f.source.beginStrike({ target: spawn.id, damage: 1, owner: "hunter", request: "before-fall", art: art })
  if (!request.ok) throw Error(request.reason)
  f.loseNextReply()
  await expect(f.source.strike("hunter", request.id)).rejects.toThrow("Response lost")
  expect((await f.recipient.run({ type: "hurt", amount: 10000, by: "スライム" })).ok).toBe(true)
  const revived = await f.recipient.run({ type: "revive" })
  if (!revived.ok) throw Error(revived.reason)
  f.restart()
  await f.source.alarm()
  await f.source.alarm()
  expect((await f.source.state(spawn.map))[spawn.id].hp).toBe(fullHp - 1)
  expect((await f.recipient.read()).sp).toBe(revived.state.sp)
  expect((await f.recipient.read()).hp).toBe(revived.state.hp)
})
