import { newPlayer } from "#/world/core/new-player"
import { afterEach, expect, it, vi } from "vitest"
import { HANDLERS } from "./exchange"
import type { Ctx } from "./context"
import { EXCHANGE_BOARD } from "../../town/boards"

const calls = vi.hoisted(() => ({ player: vi.fn(), exchange: vi.fn() }))
vi.mock("../../../durable-objects/player", () => ({ Player: { get: calls.player } }))
vi.mock("../../../durable-objects/exchange", () => ({ Exchange: { get: calls.exchange } }))
vi.mock("#/world/server/map-room/near", () => ({ near: () => true }))
afterEach(() => vi.clearAllMocks())

it.each(["constructor", "potion@1@extra", "potion@"])("refuses invalid board queries and placements before touching persistent state: %s", async (symbol) => {
  const send = vi.fn(async () => {})
  const context = { ctx: { connection: { send } }, key: { map: EXCHANGE_BOARD.map }, me: { owner: "buyer", player: { name: "買い手" } } } as unknown as Ctx
  await HANDLERS["ex-look"]!(context, { type: "ex-look", symbol })
  expect(send).not.toHaveBeenCalled()
  await HANDLERS["ex-place"]!(context, { type: "ex-place", seq: 7, side: "buy", symbol, price: 10, qty: 1 })
  expect(send).toHaveBeenCalledExactlyOnceWith({ type: "result", seq: 7, result: { ok: false, reason: "NOT_SELLABLE" } })
  expect(calls.player).not.toHaveBeenCalled()
  expect(calls.exchange).not.toHaveBeenCalled()
})

it.each(["done", "begin-failed", "placement-failed"])("uses the durable order coordinator before replying: %s", async (outcome) => {
  const result = { ok: true as const, state: newPlayer(), events: [] }
  const beginOrder = vi.fn(async () => ({ ok: true as const, id: 11 }))
  const place = vi.fn(async () => result)
  const look = vi.fn(async () => ({}))
  const run = vi.fn()
  if (outcome === "begin-failed") beginOrder.mockRejectedValue(Error("Request save failed"))
  if (outcome === "placement-failed") place.mockRejectedValue(Error("Placement save failed"))
  calls.player.mockReturnValue({ run })
  calls.exchange.mockReturnValue({ beginOrder, place, look })
  const send = vi.fn(async () => {})
  const context = { ctx: { connection: { id: "connection", send } }, key: { map: EXCHANGE_BOARD.map }, me: { owner: "buyer", player: { name: "買い手" } } } as unknown as Ctx
  const action = HANDLERS["ex-place"]!(context, { type: "ex-place", seq: 7, side: "buy", symbol: "log", price: 10, qty: 1 })
  if (outcome === "done") {
    await action
    expect(place).toHaveBeenCalledExactlyOnceWith("buyer", 11)
    expect(send).toHaveBeenCalledWith({ type: "result", seq: 7, result })
  } else {
    await expect(action).rejects.toThrow()
    expect(send).not.toHaveBeenCalled()
    expect(look).not.toHaveBeenCalled()
    if (outcome === "begin-failed") expect(place).not.toHaveBeenCalled()
  }
  expect(beginOrder).toHaveBeenCalledExactlyOnceWith({
    owner: "buyer",
    connection: "connection",
    seq: 7,
    name: "買い手",
    intent: expect.objectContaining({ side: "buy", symbol: "log", price: 10, qty: 1 }),
  })
  expect(run).not.toHaveBeenCalled()
})
