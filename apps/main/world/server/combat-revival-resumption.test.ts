import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { Wild } from "#/durable-objects/wild"
import { MONSTER_KINDS, SPAWNS } from "#/world/core/monsters"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { initialWildRecord } from "#/world/server/initial-wild-record"
import type { PlayerRecord } from "#/world/server/player-record"
import type { WildRecord } from "#/world/server/wild-record"
import { durableStorage } from "#/world/test/durable-storage"
import { player } from "#/world/test/player"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

const cases = SPAWNS.flatMap((spawn) => (MONSTER_KINDS[spawn.kind].atk > 0 ? ["death-save", "revival-save"] : ["peaceful"]).map((failure) => ({ spawn, failure })))

it.each(cases)("$spawn.id / $failure: actual retaliation, refusal and saved revival preserve the committed outcome", async (props1) => {
  const spawn = props1.spawn,
    failure = props1.failure

  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const random = vi.spyOn(Math, "random").mockReturnValue(0)
  const kind = MONSTER_KINDS[spawn.kind]
  expect(kind.hp).toBeGreaterThan(1)
  // Health, experience and an accepted strike in this authored field are local starting conditions.
  // The fall itself must come from the real monster's counterattack and persisted delivery.
  const initial = {
    ...initialPlayerRecord(),
    player: player({ hp: 1, hpAt: 1000, spAt: 1000, exp: 100, level: 10 }),
    location: { world: 2, map: spawn.map, route: [[30, 50]], since: 1000, connection: "connection" },
  }
  const playerStore = durableStorage(initial, 8)
  const wildStore = durableStorage(initialWildRecord(), 3)
  let recipient = new Player.class(playerStore.state, {})
  let source = new Wild.class(wildStore.state, {})
  vi.spyOn(Player, "get").mockImplementation(() => recipient as unknown as ReturnType<typeof Player.get>)
  const record = () => (playerStore.saved.get("__void_durable_state") as { value: PlayerRecord }).value
  const wildRecord = () => (wildStore.saved.get("__void_durable_state") as { value: WildRecord }).value
  await source.state(spawn.map)
  const request = await source.beginStrike({ target: spawn.id, damage: 1, owner: "hunter", request: "fall" })
  if (!request.ok) throw Error(request.reason)
  const struck = await source.strike("hunter", request.id)
  expect(struck).toMatchObject({ refused: false, beaten: false, hp: kind.hp - 1 })
  const rolls = random.mock.calls.length
  const healthy = structuredClone(playerStore.saved.get("__void_durable_state"))
  if (failure === "peaceful") {
    expect(struck.counter).toBeUndefined()
    expect(await source.deliverStrike("hunter", request.id)).toEqual([])
    expect(record().player.hp).toBe(1)
    expect(await recipient.reviveAtHome("connection")).toEqual({ ok: false, reason: "NOT_FALLEN" })
    expect(playerStore.saved.get("__void_durable_state")).toEqual(healthy)
    expect(random).toHaveBeenCalledTimes(rolls)
    return
  }
  expect(struck.counter?.kind).not.toBe("miss")
  if (failure === "death-save") playerStore.failNextSave()
  const notices = await source.deliverStrike("hunter", request.id)
  if (failure === "death-save") {
    expect(notices).toEqual([])
    expect(playerStore.saved.get("__void_durable_state")).toEqual(healthy)
    expect(wildRecord().deliveries.hunter).toHaveLength(1)
    recipient = new Player.class(playerStore.state, {})
    source = new Wild.class(wildStore.state, {})
    await source.alarm()
  } else {
    expect(notices).toHaveLength(1)
    expect(notices[0].result).toMatchObject({ ok: true, state: { hp: 0 }, events: [{ type: "fell", by: kind.name }] })
  }
  expect((await recipient.read()).hp).toBe(0)
  expect(record().location).toEqual(initial.location)
  expect(record().combatLife).toBe(0)
  expect(wildRecord().deliveries).toEqual({})
  const fallen = structuredClone(playerStore.saved.get("__void_durable_state"))
  const death = structuredClone(record())
  if (failure === "revival-save") {
    playerStore.failNextSave()
    await expect(recipient.reviveAtHome("connection")).rejects.toThrow("Storage unavailable")
    expect(playerStore.saved.get("__void_durable_state")).toEqual(fallen)
    recipient = new Player.class(playerStore.state, {})
  }
  const revived = await recipient.reviveAtHome("connection")
  if (!revived.ok) throw Error(revived.reason)
  expect(revived.state.hp).toBeGreaterThan(0)
  expect(revived.state.exp).toBeLessThan(death.player.exp)
  expect(record()).toEqual({
    ...death,
    player: revived.state,
    combatLife: death.combatLife + 1,
    deliveryRevision: death.deliveryRevision + 1,
    location: { ...death.location!, map: revived.state.savePoint.map, route: [revived.state.savePoint.cell], since: 1000, connection: null },
  })
  expect({ ...revived.state, hp: death.player.hp, exp: death.player.exp, revision: death.player.revision }).toEqual(death.player)
  const recovered = structuredClone(playerStore.saved.get("__void_durable_state"))
  recipient = new Player.class(playerStore.state, {})
  source = new Wild.class(wildStore.state, {})
  await source.deliverStrike("hunter", request.id)
  await source.alarm()
  expect(await recipient.reviveAtHome("connection")).toEqual({ ok: false, reason: "NOT_READY" })
  expect(playerStore.saved.get("__void_durable_state")).toEqual(recovered)
  expect(await recipient.arrive({ world: 2, map: spawn.map, connection: "new" })).toEqual({ accepted: false, map: revived.state.savePoint.map, at: revived.state.savePoint.cell })
  expect(await recipient.arrive({ world: 2, map: revived.state.savePoint.map, connection: "new" })).toEqual({ accepted: true, map: revived.state.savePoint.map, at: revived.state.savePoint.cell })
  const arrived = structuredClone(playerStore.saved.get("__void_durable_state"))
  expect(await recipient.reviveAtHome("new")).toEqual({ ok: false, reason: "NOT_FALLEN" })
  expect(playerStore.saved.get("__void_durable_state")).toEqual(arrived)
  expect((await recipient.read()).hp).toBe(revived.state.hp)
  expect(random).toHaveBeenCalledTimes(rolls)
})
