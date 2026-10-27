import { afterEach, expect, it, vi } from "vitest"
import { emptyWild, hit, hpOf } from "../../core/wild.ts"
import { MONSTER_KINDS, SPAWNS } from "../../core/monsters.ts"
import { player } from "../../test/helpers.ts"
import { mapPlayer, type Presence } from "./presence.ts"
import type { Ctx } from "./context.ts"

const calls = vi.hoisted(() => ({ state: vi.fn() }))
vi.mock("../../../durable-objects/wild.ts", () => ({ Wild: { get: () => calls } }))
import { HANDLERS } from "./wild.ts"

afterEach(() => {
  vi.useRealTimers()
  vi.resetAllMocks()
})

function fixture(map = "south-meadow") {
  const me: Presence = { player: mapPlayer("self", player(), [0, 0]), owner: "self", route: [], since: 0, said: [], engaged: null, ready: true }
  const send = vi.fn(async () => {})
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
  const state = hit(emptyWild(), spawn.id, MONSTER_KINDS[spawn.kind].hp, Date.now(), "self").state
  calls.state.mockImplementation(async () => ({ [spawn.id]: { hp: hpOf(state, spawn.id, Date.now()), back: state.back[spawn.id] } }))
  const f = fixture()
  await f.beat()
  expect(f.send).toHaveBeenLastCalledWith({ type: "wild", monsters: { [spawn.id]: { hp: 0, back: state.back[spawn.id] } } })
  vi.setSystemTime(state.back[spawn.id])
  await f.beat()
  expect(f.send).toHaveBeenLastCalledWith({ type: "wild", monsters: { [spawn.id]: { hp: MONSTER_KINDS[spawn.kind].hp, back: state.back[spawn.id] } } })
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
