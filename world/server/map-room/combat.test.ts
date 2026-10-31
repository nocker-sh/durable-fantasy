import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { emptyWild } from "#/world/core/wild/empty-wild"
import { hit } from "#/world/core/wild/hit"
import { MONSTER_KINDS, SPAWNS } from "#/world/core/monsters"
import { monsterAt } from "#/world/core/monster-at"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Wild } from "#/durable-objects/wild"
import type { Player } from "#/durable-objects/player"
import type { SkillId } from "#/world/core/skill-types"
import type { AttackRequestContext } from "#/world/server/map-room/attack-types"
import { player } from "#/world/test/player"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
const calls = vi.hoisted(() => ({
  read: vi.fn<ReturnType<typeof Player.get>["read"]>(),
  readCombat: vi.fn<ReturnType<typeof Player.get>["readCombat"]>(),
  run: vi.fn<ReturnType<typeof Player.get>["run"]>(),
  strike: vi.fn<ReturnType<typeof Wild.get>["strike"]>(),
  beginStrike: vi.fn<ReturnType<typeof Wild.get>["beginStrike"]>(),
  deliverStrike: vi.fn<ReturnType<typeof Wild.get>["deliverStrike"]>(),
}))
vi.mock("#/durable-objects/player", () => ({ Player: { get: () => calls } }))
vi.mock("#/durable-objects/wild", () => ({ Wild: { get: () => calls } }))
vi.mock("#/durable-objects/party", () => ({ Party: { get: vi.fn() } }))
vi.mock("#/world/maps/walkable", () => ({ walkable: () => true }))
import { handleAttack } from "#/world/server/map-room/handle-attack"

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
  calls.beginStrike.mockImplementation(async (input: Parameters<ReturnType<typeof Wild.get>["beginStrike"]>[0]) => {
    const result = hit({ state: beaten.state, id: input.target, damage: input.damage, now: Date.now(), player: input.owner })
    return result.refused ? { ok: false, reason: result.reason } : { ok: true, id: 1 }
  })
  const p = player()
  calls.read.mockResolvedValue(p)
  const at = monsterAt(spawn, Date.now(), () => true)
  const cell: [number, number] = [Math.floor(at.x * 2), Math.floor(at.z * 2)]
  const send = vi.fn(async () => {})
  const broadcast = vi.fn(async () => {})
  const context: AttackRequestContext = {
    ctx: { params: { mapId: "field" }, connection: { send }, room: { broadcast, getConnections: () => [] } },
    key: { map: spawn.map },
    map: { size: 1, rows: ["."] },
    me: { owner, player: mapPlayer("connection", p, cell), route: [cell], since: 1000, said: [], engaged: null },
    save: vi.fn(),
    standUp: vi.fn(async () => true),
  }
  await handleAttack(context, { type: "attack", monster: spawn.id })
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
] satisfies Array<[string, SkillId | undefined]>)("rejects %s attacks from persisted zero HP even before presence marks the player down", async (_label, art) => {
  const spawn = SPAWNS.find((s) => s.kind === "slime")!
  const at = monsterAt(spawn, Date.now(), () => true)
  const cell: [number, number] = [Math.floor(at.x * 2), Math.floor(at.z * 2)]
  const alive = player()
  calls.read.mockResolvedValue({ ...alive, hp: 0 })
  calls.strike.mockResolvedValue({ refused: true, beaten: false, hp: 0, back: 0, reason: "TARGET_GONE" })
  const send = vi.fn(async () => {})
  const broadcast = vi.fn(async () => {})
  const save = vi.fn()
  const standUp = vi.fn(async () => true)
  const context: AttackRequestContext = {
    ctx: { params: { mapId: "field" }, connection: { send }, room: { broadcast, getConnections: () => [] } },
    key: { map: spawn.map },
    map: { size: 1, rows: ["."] },
    me: { owner: "hunter", player: mapPlayer("connection", alive, cell), route: [cell], since: Date.now(), down: false, said: [], engaged: null },
    save,
    standUp,
  }
  await handleAttack(context, { type: "attack", monster: spawn.id, ...(art ? { art } : {}) })
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
    const context: AttackRequestContext = {
      ctx: {
        params: { mapId: "field" },
        connection: { send: vi.fn().mockRejectedValue(Error("Socket closed")) },
        room: { broadcast: vi.fn().mockRejectedValue(Error("Socket closed")), getConnections: () => [] },
      },
      key: { map: spawn.map },
      map: { size: 1, rows: ["."] },
      me: { owner: "hunter", player: mapPlayer("connection", p, cell), route: [cell], since: Date.now(), said: [], engaged: null },
      save: vi.fn(),
      standUp: vi.fn(async () => true),
    }
    await handleAttack(context, { type: "attack", monster: spawn.id })
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
  const context: AttackRequestContext = {
    ctx: { params: { mapId: "field" }, connection: { send }, room: { broadcast, getConnections: () => [] } },
    key: { map: spawn.map },
    map: { size: 1, rows: ["."] },
    me: { owner: "hunter", player: mapPlayer("connection", p, cell), route: [cell], since: Date.now(), sitting: true, said: [], engaged: null },
    save,
    standUp: async () => false,
  }
  await handleAttack(context, { type: "attack", monster: spawn.id })
  expect(calls.beginStrike).not.toHaveBeenCalled()
  expect(calls.strike).not.toHaveBeenCalled()
  expect(save).not.toHaveBeenCalled()
  expect(broadcast).not.toHaveBeenCalled()
  expect(send).toHaveBeenCalledExactlyOnceWith({ type: "refused", what: "attack", monster: spawn.id, reason: "NOT_READY" })
})
