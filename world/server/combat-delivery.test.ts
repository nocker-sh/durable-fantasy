import { afterEach, expect, it, vi } from "vitest"
import { Player } from "../../durable-objects/player"
import { Wild } from "../../durable-objects/wild"
import { emptyWild } from "#/world/core/wild/empty-wild"
import { MONSTER_KINDS, SPAWNS } from "#/world/core/monsters"
import type { CombatDelivery } from "#/world/core/combat-delivery-types"
import { player } from "#/world/test/player"
import { durableStorage } from "../test/durable-storage"
import type { WildRecord } from "#/world/server/wild-record"
import { initialPlayerRecord } from "#/world/server/initial-player-record"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
const spawn = SPAWNS.find((s) => s.kind === "slime")!
const kind = MONSTER_KINDS[spawn.kind]
async function fixture() {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const random = vi.spyOn(Math, "random").mockReturnValue(0)
  const before = player({ hp: 10 })
  const recipientStore = durableStorage({ ...initialPlayerRecord(), player: before }, 6)
  const sourceStore = durableStorage({ wild: emptyWild() }, 0)
  let recipient = new Player.class(recipientStore.state, {})
  let source = new Wild.class(sourceStore.state, {})
  await recipient.read()
  await source.state(spawn.map)
  let loseReply = false
  const receive = vi.fn(async (key: string, delivery: CombatDelivery) => {
    const result = await recipient.receiveCombat(key, delivery)
    if (loseReply) {
      loseReply = false
      throw Error("Response lost")
    }
    return result
  })
  vi.spyOn(Player, "get").mockReturnValue({
    payStrike: (...args: Parameters<typeof recipient.payStrike>) => recipient.payStrike(...args),
    read: () => recipient.read(),
    readCombat: () => recipient.readCombat(),
    receiveCombat: receive,
  } as unknown as ReturnType<typeof Player.get>)
  return {
    before,
    recipientStore,
    sourceStore,
    random,
    receive,
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
    },
    begin: async (kill = true) => {
      const request = await source.beginStrike({ target: spawn.id, damage: kill ? kind.hp : 1, owner: "hunter", request: "request" })
      if (!request.ok) throw Error(request.reason)
      return request.id
    },
  }
}

it.each(["reply", "source-save", "recipient-save"].flatMap((failure) => [true, false].map((kill) => [failure, kill] as const)))(
  "recovers %s during delivery, once across restart (kill=%s)",
  async (failure, kill) => {
    const f = await fixture()
    const id = await f.begin(kill)
    const result = await f.source.strike("hunter", id)
    expect((await f.recipient.read()).exp).toBe(f.before.exp)
    expect((await f.recipient.read()).hp).toBe(f.before.hp)
    if (failure === "reply") f.loseNextReply()
    if (failure === "source-save") f.sourceStore.failNextSave()
    if (failure === "recipient-save") f.recipientStore.failNextSave()
    if (failure === "source-save") await expect(f.source.deliverStrike("hunter", id)).rejects.toThrow("Storage unavailable")
    else await f.source.deliverStrike("hunter", id)
    const rolls = f.random.mock.calls.length
    f.restart()
    await f.source.alarm()
    await f.source.alarm()
    await f.source.deliverStrike("hunter", id)
    expect(f.random).toHaveBeenCalledTimes(rolls)
    const after = await f.recipient.read()
    if (kill) {
      expect(after.exp).toBe(f.before.exp + kind.exp)
      expect(after.bag.find((slot) => slot?.item === "jelly")?.count).toBe(1)
    } else {
      expect(result.counter?.kind).not.toBe("miss")
      const damage = result.counter && result.counter.kind !== "miss" ? result.counter.damage : 0
      expect(after.hp).toBe(Math.max(0, f.before.hp - damage))
    }
    expect((await f.recipient.deliveryUpdate(null)).revision).toBe(1)
    expect(await f.recipient.deliveryUpdate(1)).toEqual({ revision: 1, player: null })
    expect((f.sourceStore.saved.get("__void_durable_state") as { value: WildRecord }).value.deliveries).toEqual({})
  },
)

it("does not deliver a reward before the hit has been durably saved, including in an alarm", async () => {
  const f = await fixture()
  await f.begin()
  f.sourceStore.failNextSave()
  await expect(f.source.strike("hunter", 1)).rejects.toThrow("Storage unavailable")
  expect(f.receive).not.toHaveBeenCalled()
  f.restart()
  await f.source.alarm()
  expect(f.receive).not.toHaveBeenCalled()
  expect((await f.source.state(spawn.map))[spawn.id].hp).toBe(0)
  await f.source.alarm()
  expect((await f.recipient.read()).exp).toBe(f.before.exp + kind.exp)
})

it("retains earned rewards while a trade is prepared, then delivers them after it ends", async () => {
  const f = await fixture()
  const id = await f.begin()
  await f.source.strike("hunter", id)
  const proposal = { id: "trade", revision: 1, offer: { lots: [], gold: 0 }, outgoing: [], incoming: [], gold: 0 }
  expect((await f.recipient.prepareTrade(proposal)).ok).toBe(true)
  expect(await f.source.deliverStrike("hunter", id)).toEqual([])
  expect((await f.recipient.read()).exp).toBe(f.before.exp)
  expect((await f.recipient.finishTrade({ id: "trade", revision: 1, decision: "aborted" })).ok).toBe(true)
  await f.source.alarm()
  expect((await f.recipient.read()).exp).toBe(f.before.exp + kind.exp)
})

it("does not apply a delayed retaliation after revival and does not replay its receipt", async () => {
  const f = await fixture()
  const id = await f.begin(false)
  await f.source.strike("hunter", id)
  expect((await f.recipient.run({ type: "hurt", amount: 1000, by: "スライム" })).ok).toBe(true)
  const revived = await f.recipient.run({ type: "revive" })
  if (!revived.ok) throw Error(revived.reason)
  expect((await f.recipient.readCombat()).life).toBe(1)
  await f.source.deliverStrike("hunter", id)
  f.restart()
  await f.source.alarm()
  expect((await f.recipient.read()).hp).toBe(revived.state.hp)
})

it("retries an uncertain earlier receipt before sending the next reward to that player", async () => {
  const f = await fixture()
  const envelope = f.sourceStore.saved.get("__void_durable_state") as { value: WildRecord }
  envelope.value.deliverySerial = 2
  envelope.value.deliveries.hunter = [
    { id: 1, command: { type: "share", monster: spawn.id, exp: 2 } },
    { id: 2, command: { type: "share", monster: spawn.id, exp: 3 } },
  ]
  f.restart()
  f.loseNextReply()
  await f.source.alarm()
  expect((await f.recipient.read()).exp).toBe(f.before.exp + 2)
  await f.source.alarm()
  expect((await f.recipient.read()).exp).toBe(f.before.exp + 2)
  await f.source.alarm()
  expect(f.receive.mock.calls.map(([, delivery]) => delivery.id)).toEqual([1, 1, 2])
  expect((await f.recipient.read()).exp).toBe(f.before.exp + 5)
  expect((await f.recipient.deliveryUpdate(null)).revision).toBe(2)
})

it("continues delivering to other players when the first recipient stays unavailable", async () => {
  const f = await fixture()
  const envelope = f.sourceStore.saved.get("__void_durable_state") as { value: WildRecord }
  envelope.value.deliverySerial = 2
  envelope.value.deliveries = {
    unavailable: [{ id: 1, command: { type: "share", monster: spawn.id, exp: 2 } }],
    hunter: [{ id: 2, command: { type: "share", monster: spawn.id, exp: 3 } }],
  }
  f.restart()
  vi.mocked(Player.get).mockImplementation(
    (owner: unknown) =>
      (owner === "unavailable"
        ? {
            receiveCombat: async () => {
              throw Error("Player unavailable")
            },
          }
        : { receiveCombat: f.receive }) as unknown as ReturnType<typeof Player.get>,
  )
  await f.source.alarm()
  expect((await f.recipient.read()).exp).toBe(f.before.exp + 3)
  expect((f.sourceStore.saved.get("__void_durable_state") as { value: WildRecord }).value.deliveries).toEqual({ unavailable: envelope.value.deliveries.unavailable })
})

it("checkpoints one effect per recipient before advancing its receipt, even if the source save fails", async () => {
  const f = await fixture()
  const envelope = f.sourceStore.saved.get("__void_durable_state") as { value: WildRecord }
  envelope.value.deliverySerial = 2
  envelope.value.deliveries.hunter = [
    { id: 1, command: { type: "share", monster: spawn.id, exp: 2 } },
    { id: 2, command: { type: "share", monster: spawn.id, exp: 3 } },
  ]
  f.restart()
  f.sourceStore.failNextSave()
  await expect(f.source.alarm()).rejects.toThrow("Storage unavailable")
  expect(f.receive.mock.calls.map(([, delivery]) => delivery.id)).toEqual([1])
  f.restart()
  await f.source.alarm()
  expect(f.receive.mock.calls.map(([, delivery]) => delivery.id)).toEqual([1, 1])
  await f.source.alarm()
  expect((await f.recipient.read()).exp).toBe(f.before.exp + 5)
  expect(f.receive.mock.calls.map(([, delivery]) => delivery.id)).toEqual([1, 1, 2])
})
