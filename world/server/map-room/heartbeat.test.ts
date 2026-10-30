import { afterEach, expect, it, vi } from "vitest"
import { emptyWild } from "#/world/core/wild/empty-wild"
import { hit } from "#/world/core/wild/hit"
import { hpOf } from "#/world/core/wild/hp-of"
import { MONSTER_KINDS, SPAWNS } from "#/world/core/monsters"
import { player } from "#/world/test/player"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Presence } from "#/world/server/map-room/presence"
import type { ServerMessage } from "#/world/protocol"
import type { Ctx } from "#/world/server/map-room/context"

const calls = vi.hoisted(() => ({ state: vi.fn(), deliveryUpdate: vi.fn(), left: vi.fn() }))
vi.mock("../../../durable-objects/wild", () => ({ Wild: { get: () => ({ snapshot: async (map: string) => ({ revision: 1, monsters: await calls.state(map) }) }) } }))
vi.mock("../../../durable-objects/nature", () => ({ Nature: { get: () => calls } }))
vi.mock("../../../durable-objects/player", () => ({ Player: { get: () => calls } }))
import { HANDLERS } from "#/world/server/map-room/heartbeat"

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.resetAllMocks()
})

function fixture(map = "south-meadow") {
  calls.deliveryUpdate.mockResolvedValue({ revision: 0, player: null })
  calls.left.mockResolvedValue({})
  const me: Presence = { player: mapPlayer("self", player(), [0, 0]), owner: "self", route: [[0, 0]], since: 0, said: [], engaged: null, ready: true }
  const send = vi.fn(async (_message: ServerMessage) => {})
  const context = {
    ctx: { connection: { state: me, send }, params: { mapId: `1~${map}~1` } },
    key: { map },
    me,
    save: (patch: Partial<Presence>) => Object.assign(me, patch),
  } as unknown as Ctx
  return { context, me, send, beat: () => HANDLERS.heartbeat!(context, { type: "heartbeat" }) }
}

it("refreshes a defeated creature before and after its authoritative recovery without rejoining", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const spawn = SPAWNS.find((s) => s.map === "south-meadow" && s.kind === "slime")!
  const state = hit({ state: emptyWild(), id: spawn.id, damage: MONSTER_KINDS[spawn.kind].hp, now: Date.now(), player: "self" }).state
  calls.state.mockImplementation(async () => ({ [spawn.id]: { hp: hpOf(state, spawn.id, Date.now()), back: state.back[spawn.id] } }))
  const f = fixture()
  await f.beat()
  expect(f.send).toHaveBeenLastCalledWith({ type: "wild", revision: 1, monsters: { [spawn.id]: { hp: 0, back: state.back[spawn.id] } } })
  vi.setSystemTime(state.back[spawn.id])
  await f.beat()
  expect(f.send).toHaveBeenLastCalledWith({ type: "wild", revision: 1, monsters: { [spawn.id]: { hp: MONSTER_KINDS[spawn.kind].hp, back: state.back[spawn.id] } } })
})

it("bounds repeated refreshes and skips maps without creatures and inactive connections", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  calls.state.mockResolvedValue({})
  const f = fixture()
  for (let i = 0; i < 10; i++) await f.beat()
  expect(calls.state).toHaveBeenCalledTimes(1)
  vi.advanceTimersByTime(5000)
  await f.beat()
  expect(calls.state).toHaveBeenCalledTimes(2)
  await fixture("phanthiet").beat()
  for (const patch of [{ ready: false }, { player: null }, { closed: true }]) {
    const inactive = fixture()
    Object.assign(inactive.me, patch)
    await inactive.beat()
  }
  expect(calls.state).toHaveBeenCalledTimes(2)
})

it("does not deliver after disconnecting during the authoritative read", async () => {
  const f = fixture()
  calls.state.mockImplementation(async () => {
    f.me.closed = true
    return {}
  })
  await f.beat()
  expect(f.send).not.toHaveBeenCalled()
})

it("reconciles a recovered combat effect even after travelling to a town, without repeating unchanged player state", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const f = fixture("phanthiet")
  const updated = player({ exp: 9, hp: 0 })
  calls.deliveryUpdate.mockResolvedValueOnce({ revision: 1, player: updated }).mockResolvedValue({ revision: 1, player: null })
  await f.beat()
  expect(f.send).toHaveBeenCalledExactlyOnceWith({ type: "result", seq: -1, result: { ok: true, state: updated, events: [] } })
  expect(f.me.down).toBe(true)
  expect(calls.state).not.toHaveBeenCalled()
  vi.advanceTimersByTime(5000)
  await f.beat()
  expect(calls.deliveryUpdate).toHaveBeenLastCalledWith(1)
  expect(f.send).toHaveBeenCalledOnce()
})

it("retries an unsent combat revision while bounding attempts and still refreshing creatures", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  const f = fixture()
  const updated = player({ exp: 9, hp: 0 })
  calls.deliveryUpdate.mockImplementation(async (after) => ({ revision: 1, player: after === 1 ? null : updated }))
  calls.state.mockResolvedValue({})
  f.send.mockRejectedValueOnce(Error("Socket unavailable"))
  await f.beat()
  expect(f.me.deliveryRevision).toBeUndefined()
  expect(f.me.down).toBe(true)
  expect(f.me.route).toEqual([[0, 0]])
  expect(f.send).toHaveBeenLastCalledWith({ type: "wild", revision: 1, monsters: {} })
  expect(warn).toHaveBeenCalledExactlyOnceWith("Game notification could not be delivered")
  for (let i = 0; i < 10; i++) await f.beat()
  expect(calls.deliveryUpdate).toHaveBeenCalledOnce()
  expect(calls.state).toHaveBeenCalledOnce()
  vi.advanceTimersByTime(5000)
  await f.beat()
  expect(calls.deliveryUpdate).toHaveBeenLastCalledWith(null)
  expect(f.me.deliveryRevision).toBe(1)
  vi.advanceTimersByTime(5000)
  await f.beat()
  expect(calls.deliveryUpdate).toHaveBeenLastCalledWith(1)
  expect(f.send.mock.calls.filter(([message]) => message.type === "result")).toHaveLength(2)
})

it.each(["player", "wild"])("delivers the independent refresh and throttles retries when the %s read fails", async (failed) => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  const f = fixture()
  const updated = player({ exp: 9 })
  calls.deliveryUpdate.mockImplementation(async (after) => ({ revision: 1, player: after === 1 ? null : updated }))
  calls.state.mockResolvedValue({})
  const error = Error("Storage unavailable")
  if (failed === "player") calls.deliveryUpdate.mockRejectedValueOnce(error)
  else calls.state.mockRejectedValueOnce(error)
  await expect(f.beat()).rejects.toBe(error)
  expect(warn).not.toHaveBeenCalled()
  expect(f.send).toHaveBeenCalledExactlyOnceWith(failed === "player" ? { type: "wild", revision: 1, monsters: {} } : { type: "result", seq: -1, result: { ok: true, state: updated, events: [] } })
  expect(f.me.deliveryRevision).toBe(failed === "player" ? undefined : 1)
  for (let i = 0; i < 10; i++) await f.beat()
  expect(calls.deliveryUpdate).toHaveBeenCalledOnce()
  expect(calls.state).toHaveBeenCalledOnce()
  vi.advanceTimersByTime(5000)
  await f.beat()
  expect(calls.deliveryUpdate).toHaveBeenCalledTimes(2)
  expect(calls.state).toHaveBeenCalledTimes(2)
  expect(f.me.deliveryRevision).toBe(1)
  expect(f.send.mock.calls.filter(([message]) => message.type === "result")).toHaveLength(1)
  expect(f.send.mock.calls.filter(([message]) => message.type === "wild")).toHaveLength(failed === "player" ? 2 : 1)
})

it.each(["player", "wild"])("does not wait for the slow %s read before delivering the other refresh", async (slow) => {
  const f = fixture()
  const updated = player({ exp: 9 })
  calls.deliveryUpdate.mockResolvedValue({ revision: 1, player: updated })
  calls.state.mockResolvedValue({})
  let release!: (value: unknown) => void
  const blocked = new Promise((resolve) => {
    release = resolve
  })
  if (slow === "player") calls.deliveryUpdate.mockReturnValueOnce(blocked)
  else calls.state.mockReturnValueOnce(blocked)
  let sent!: () => void
  const independent = new Promise<void>((resolve) => {
    sent = resolve
  })
  f.send.mockImplementation(async (message) => {
    if (message.type === (slow === "player" ? "wild" : "result")) sent()
  })
  let finished = false
  const beat = f.beat().then(() => {
    finished = true
  })
  await independent
  expect(finished).toBe(false)
  expect(f.send).toHaveBeenCalledOnce()
  release(slow === "player" ? { revision: 1, player: updated } : {})
  await beat
  expect(finished).toBe(true)
  expect(f.send).toHaveBeenCalledTimes(2)
})

it("refreshes a recovered resource reservation without rejoining and bounds attempts on failure", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const f = fixture()
  calls.state.mockResolvedValue({})
  calls.left.mockRejectedValueOnce(Error("Nature unavailable")).mockResolvedValue({ "south-meadow-herbs-1": 3 })
  await expect(f.beat()).rejects.toThrow("Nature unavailable")
  expect(calls.deliveryUpdate).toHaveBeenCalledOnce()
  expect(calls.state).toHaveBeenCalledOnce()
  await f.beat()
  expect(calls.left).toHaveBeenCalledOnce()
  vi.advanceTimersByTime(5000)
  await f.beat()
  expect(f.send).toHaveBeenCalledWith({ type: "nodes", left: { "south-meadow-herbs-1": 3 } })
})

it("reconciles saved posture before sending a recovered state, even if the notification fails", async () => {
  const f = fixture("phanthiet")
  calls.deliveryUpdate.mockResolvedValue({ revision: 1, player: player({ sitting: true }) })
  f.send.mockRejectedValueOnce(Error("Socket unavailable"))
  vi.spyOn(console, "warn").mockImplementation(() => {})
  await f.beat()
  expect(f.me.sitting).toBe(true)
  expect(f.me.deliveryRevision).toBeUndefined()
})
