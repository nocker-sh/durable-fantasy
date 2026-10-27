import { afterEach, expect, it, vi } from "vitest"
import { emptyWild, hit } from "../../core/wild.ts"
import { MONSTER_KINDS, SPAWNS, monsterAt } from "../../core/monsters.ts"
import { mapPlayer } from "./presence.ts"
import type { Ctx } from "./context.ts"
import { player } from "../../test/helpers.ts"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
const calls = vi.hoisted(() => ({ read: vi.fn(), run: vi.fn(), strike: vi.fn() }))
vi.mock("../../../durable-objects/player.ts", () => ({ Player: { get: () => calls } }))
vi.mock("../../../durable-objects/wild.ts", () => ({ Wild: { get: () => calls } }))
vi.mock("../../../durable-objects/party.ts", () => ({ Party: { get: vi.fn() } }))
vi.mock("../../maps/index.ts", () => ({ walkable: () => true }))
import { HANDLERS } from "./combat.ts"

afterEach(() => {
  vi.useRealTimers()
  vi.resetAllMocks()
})

it.each(["hunter", "other"])("does not broadcast a blow or retaliate when %s attacks a defeated creature", async (owner) => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const spawn = SPAWNS.find((s) => s.kind === "slime")!
  const beaten = hit(emptyWild(), spawn.id, MONSTER_KINDS[spawn.kind].hp, 999, "hunter")
  calls.strike.mockImplementation(async (id, damage, who) => {
    const result = hit(beaten.state, id, damage, Date.now(), who)
    return { ...result, back: result.state.back[id] ?? 0 }
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
    standUp: vi.fn(async () => {}),
  } as unknown as Ctx
  await HANDLERS.attack!(context, { type: "attack", monster: spawn.id })
  expect(calls.strike).toHaveBeenCalledOnce()
  expect(send).toHaveBeenCalledWith({ type: "refused", what: "attack", reason: "TARGET_GONE" })
  expect(broadcast).not.toHaveBeenCalled()
  expect(calls.run).not.toHaveBeenCalled()
  expect(beaten.state.back[spawn.id]).toBe(999 + MONSTER_KINDS[spawn.kind].respawn * 1000)
})
