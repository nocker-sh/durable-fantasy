import { afterEach, expect, it, vi } from "vitest"
import { apply } from "../../core/apply"
import type { ServerCommand } from "../../core/commands"
import type { Stack } from "#/world/core/bag-types"
import type { PlayerState } from "#/world/core/player-types"
import type { Ctx } from "./context"
import { player } from "#/world/test/player"
const rpc = vi.hoisted(() => ({ read: vi.fn(), run: vi.fn() }))
vi.mock("../../../durable-objects/player", () => ({ Player: { get: () => rpc } }))
vi.mock("../../../durable-objects/market", () => ({ Market: { get: vi.fn() } }))
vi.mock("../../../durable-objects/nature", () => ({ Nature: { get: vi.fn() } }))
vi.mock("#/world/maps/npc-cell", () => ({ npcCell: () => [10, 10] }))
import { HANDLERS } from "./work"
afterEach(() => vi.resetAllMocks())
function fixture() {
  const orders = [
    { commission: "gunter-sword", readyAt: 1000, q: 1 as const },
    { commission: "irmgard-potions", readyAt: 2000, q: 2 as const },
  ]
  let current: PlayerState = player({ orders })
  rpc.read.mockImplementation(async () => structuredClone(current))
  rpc.run.mockImplementation(async (command: ServerCommand) => {
    const result = apply(current, command, { now: 3000 })
    if (result.ok) current = result.state
    return result
  })
  const send = vi.fn(async () => {})
  const context = { ctx: { connection: { send } }, map: {}, me: { owner: "owner", player: { id: "player" }, route: [[10, 10]], since: 0, held: 20 * 60 } } as unknown as Ctx
  return {
    context,
    orders,
    send,
    collect: () => HANDLERS.collect!(context, { type: "collect", seq: 7, index: 0, orders }),
    change: (next: PlayerState) => {
      current = next
    },
    state: () => current,
  }
}
it("passes the displayed queue through to the authoritative command", async () => {
  const f = fixture()
  await f.collect()
  expect(rpc.run).toHaveBeenCalledExactlyOnceWith({ type: "collect", index: 0, expectedOrders: f.orders })
  expect(f.state().orders).toHaveLength(1)
  expect(f.send).toHaveBeenCalledWith(expect.objectContaining({ type: "result", seq: 7, result: expect.objectContaining({ ok: true }) }))
})
it("rejects a stale client queue before choosing a craftsman", async () => {
  const f = fixture()
  f.change(player({ orders: f.orders.slice(1) }))
  await f.collect()
  expect(rpc.run).not.toHaveBeenCalled()
  expect(f.send).toHaveBeenCalledWith({ type: "result", seq: 7, result: { ok: false, reason: "ORDER_CHANGED" } })
})
it("rejects a queue change between the proximity read and the player command", async () => {
  const f = fixture(),
    beforeBag = structuredClone(f.state().bag)
  rpc.run.mockImplementationOnce(async (command: ServerCommand) => {
    f.change(player({ orders: f.orders.slice(1) }))
    return apply(f.state(), command, { now: 3000 })
  })
  await f.collect()
  expect(f.send).toHaveBeenCalledWith({ type: "result", seq: 7, result: { ok: false, reason: "ORDER_CHANGED" } })
  expect(f.state().orders).toEqual(f.orders.slice(1))
  expect(f.state().bag).toEqual(beforeBag)
})

it.each(["store", "retrieve"] as const)("passes the selected %s stack into the atomic player command", async (action) => {
  const f = fixture(),
    stack: Stack = { item: "herb", count: 5 }
  const state = player({ gold: 20, ...(action === "store" ? { bag: [stack] } : { storage: [stack] }) })
  f.change(state)
  await HANDLERS.storage!(f.context, { type: "storage", action, seq: 8, index: 0, count: 1, stack })
  expect(rpc.run).toHaveBeenCalledExactlyOnceWith({ type: action, ...(action === "store" ? { slot: 0 } : { index: 0 }), count: 1, expectedStack: stack })
  expect(f.send).toHaveBeenCalledWith(expect.objectContaining({ result: expect.objectContaining({ ok: true }) }))
})
