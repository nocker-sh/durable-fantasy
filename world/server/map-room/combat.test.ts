import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { emptyWild } from "#/world/core/wild/empty-wild"
import { hit } from "#/world/core/wild/hit"
import { MONSTER_KINDS, SPAWNS } from "#/world/core/monsters"
import { monsterAt } from "#/world/core/monster-at"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Ctx } from "./context"
import { player } from "#/world/test/player"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
const calls = vi.hoisted(() => ({ read: vi.fn(), readCombat: vi.fn(), run: vi.fn(), strike: vi.fn(), beginStrike: vi.fn(), deliverStrike: vi.fn() }))
vi.mock("../../../durable-objects/player", () => ({ Player: { get: () => calls } }))
vi.mock("../../../durable-objects/wild", () => ({ Wild: { get: () => calls } }))
vi.mock("../../../durable-objects/party", () => ({ Party: { get: vi.fn() } }))
vi.mock("#/world/maps/walkable", () => ({ walkable: () => true }))
import { HANDLERS } from "./combat"

beforeEach(() => {
  calls.beginStrike.mockResolvedValue({ ok: true, id: 1 })
  calls.readCombat.mockImplementation(async () => ({ player: await calls.read(), life: 0 }))
})

afterEach(() => {
  vi.useRealTimers()
  vi.resetAllMocks()
})

it.each(["hunter", "other"])("does not broadcast a blow or retaliate when %s attacks a defeated creature", async (owner) => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const spawn = SPAWNS.find((s) => s.kind === "slime")!
  const beaten = hit({ state: emptyWild(), id: spawn.id, damage: MONSTER_KINDS[spawn.kind].hp, now: 999, player: "hunter" })
  calls.beginStrike.mockImplementation(async (id, damage, who) => {
    const result = hit({ state: beaten.state, id: id, damage: damage, now: Date.now(), player: who })
    return result.refused ? { ok: false, reason: result.reason } : { ok: true, id: 1 }
  })
  const p = player()
  calls.read.mockResolvedValue(p)
  const at = monsterAt(spawn, Date.now(), () => true)
  const cell: [number, number] = [Math.floor(at.x * 2), Math.floor(at.z * 2)]
  const send = vi.fn(async () => {})
  const broadcast = vi.fn(async () => {})
  const context = {
    ctx: { params: { mapId: "field" }, connection: { send }, room: { broadcast } },
    key: { map: spawn.map },
    map: {},
    me: { owner, player: mapPlayer("connection", p, cell), route: [cell], since: 1000 },
    save: vi.fn(),
    standUp: vi.fn(async () => true),
  } as unknown as Ctx
  await HANDLERS.attack!(context, { type: "attack", monster: spawn.id })
  expect(calls.beginStrike).toHaveBeenCalledOnce()
  expect(calls.strike).not.toHaveBeenCalled()
  expect(send).toHaveBeenCalledWith({ type: "refused", what: "attack", monster: spawn.id, reason: "TARGET_GONE" })
  expect(broadcast).not.toHaveBeenCalled()
  expect(calls.run).not.toHaveBeenCalled()
  expect(beaten.state.back[spawn.id]).toBe(999 + MONSTER_KINDS[spawn.kind].respawn * 1000)
})

it.each([
  ["normal", undefined],
  ["lunge", "lunge"],
] as const)("rejects %s attacks from persisted zero HP even before presence marks the player down", async (_label, art) => {
  const spawn = SPAWNS.find((s) => s.kind === "slime")!
  const at = monsterAt(spawn, Date.now(), () => true)
  const cell: [number, number] = [Math.floor(at.x * 2), Math.floor(at.z * 2)]
  const alive = player()
  calls.read.mockResolvedValue({ ...alive, hp: 0 })
  calls.strike.mockResolvedValue({ refused: true, reason: "TARGET_GONE" })
  const send = vi.fn(async () => {})
  const broadcast = vi.fn(async () => {})
  const save = vi.fn()
  const standUp = vi.fn(async () => true)
  const context = {
    ctx: { params: { mapId: "field" }, connection: { send }, room: { broadcast } },
    key: { map: spawn.map },
    map: {},
    me: { owner: "hunter", player: mapPlayer("connection", alive, cell), route: [cell], since: Date.now(), down: false },
    save,
    standUp,
  } as unknown as Ctx
  await HANDLERS.attack!(context, { type: "attack", monster: spawn.id, ...(art ? { art } : {}) })
  expect(calls.strike).not.toHaveBeenCalled()
  expect(calls.run).not.toHaveBeenCalled()
  expect(broadcast).not.toHaveBeenCalled()
  expect(save).not.toHaveBeenCalled()
  expect(standUp).not.toHaveBeenCalled()
  expect(send).toHaveBeenCalledWith({ type: "refused", what: "attack", monster: spawn.id, reason: "FALLEN" })
})

it("persists retaliation even if the attack broadcast and result delivery fail", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  const random = vi.spyOn(Math, "random").mockReturnValue(0)
  try {
    const spawn = SPAWNS.find((s) => s.kind === "slime")!
    const p = player()
    calls.read.mockResolvedValue(p)
    calls.strike.mockResolvedValue({ refused: false, beaten: false, hp: 1, back: 0, counter: { kind: "hit", damage: 1 } })
    calls.deliverStrike.mockResolvedValue([{ owner: "hunter", result: { ok: true, state: { ...p, hp: 5 }, events: [] } }])
    const at = monsterAt(spawn, Date.now(), () => true)
    const cell: [number, number] = [Math.floor(at.x * 2), Math.floor(at.z * 2)]
    const context = {
      ctx: {
        params: { mapId: "field" },
        connection: { send: vi.fn().mockRejectedValue(Error("Socket closed")) },
        room: { broadcast: vi.fn().mockRejectedValue(Error("Socket closed")) },
      },
      key: { map: spawn.map },
      map: {},
      me: { owner: "hunter", player: mapPlayer("connection", p, cell), route: [cell], since: Date.now() },
      save: vi.fn(),
      standUp: vi.fn(async () => true),
    } as unknown as Ctx
    await HANDLERS.attack!(context, { type: "attack", monster: spawn.id })
    expect(calls.deliverStrike).toHaveBeenCalledExactlyOnceWith("hunter", 1)
    expect(calls.run).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledTimes(3)
  } finally {
    warn.mockRestore()
    random.mockRestore()
  }
})

it("does not reserve or pay for an attack when standing is refused", async () => {
  const spawn = SPAWNS.find((s) => s.kind === "slime")!
  const at = monsterAt(spawn, Date.now(), () => true)
  const cell: [number, number] = [Math.floor(at.x * 2), Math.floor(at.z * 2)]
  const p = player({ sitting: true })
  calls.read.mockResolvedValue(p)
  const send = vi.fn(async () => {}),
    broadcast = vi.fn(async () => {}),
    save = vi.fn()
  const context = {
    ctx: { params: { mapId: "field" }, connection: { send }, room: { broadcast } },
    key: { map: spawn.map },
    map: {},
    me: { owner: "hunter", player: mapPlayer("connection", p, cell), route: [cell], since: Date.now(), sitting: true },
    save,
    standUp: async () => false,
  } as unknown as Ctx
  await HANDLERS.attack!(context, { type: "attack", monster: spawn.id })
  expect(calls.beginStrike).not.toHaveBeenCalled()
  expect(calls.strike).not.toHaveBeenCalled()
  expect(save).not.toHaveBeenCalled()
  expect(broadcast).not.toHaveBeenCalled()
  expect(send).toHaveBeenCalledExactlyOnceWith({ type: "refused", what: "attack", monster: spawn.id, reason: "NOT_READY" })
})
