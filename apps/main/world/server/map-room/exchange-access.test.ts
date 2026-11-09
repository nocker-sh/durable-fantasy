import { afterEach, expect, it, vi } from "vitest"
import { handleExchangeRequest } from "#/world/server/map-room/handle-exchange-request"
import { EXCHANGE_BOARD } from "#/world/town/boards"
import { newPlayer } from "#/world/core/new-player"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Presence } from "#/world/server/map-room/presence"
import type { ExchangeView, ServerMessage } from "#/world/protocol"

const rpc = vi.hoisted(() => ({ player: vi.fn(), exchange: vi.fn(), near: vi.fn(() => true) }))
vi.mock("#/durable-objects/player", () => ({ Player: { get: rpc.player } }))
vi.mock("#/durable-objects/exchange", () => ({ Exchange: { get: rpc.exchange } }))
vi.mock("#/world/server/map-room/near", () => ({ near: rpc.near }))
afterEach(() => vi.resetAllMocks())

function fixture() {
  rpc.near.mockReturnValue(true)
  const me: Presence = { owner: "buyer", player: mapPlayer("connection", newPlayer(), [0, 0]), route: [[0, 0]], since: 0, said: [], engaged: null }
  const send = vi.fn(async (_message: ServerMessage) => {})
  const room = { me, key: { map: EXCHANGE_BOARD.map }, ctx: { connection: { id: "connection", send } } }
  return { room, send }
}

it.each(["owner", "player"])("does not touch persistent state without a participating %s", async (missing) => {
  const request = fixture()
  if (missing === "owner") request.room.me.owner = null
  else request.room.me.player = null
  await handleExchangeRequest(request.room, { type: "ex-claim", seq: 7 })
  expect(request.send).not.toHaveBeenCalled()
  expect(rpc.exchange).not.toHaveBeenCalled()
  expect(rpc.player).not.toHaveBeenCalled()
  expect(rpc.near).not.toHaveBeenCalled()
})

it("rejects another map before proximity or persistent-state access", async () => {
  const request = fixture()
  request.room.key.map = "other-map"
  await handleExchangeRequest(request.room, { type: "ex-claim", seq: 7 })
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "result", seq: 7, result: { ok: false, reason: "TOO_FAR" } })
  expect(rpc.near).not.toHaveBeenCalled()
  expect(rpc.exchange).not.toHaveBeenCalled()
})

it("checks distance before symbol validity and leaves rejected board queries silent", async () => {
  const request = fixture()
  rpc.near.mockReturnValue(false)
  await handleExchangeRequest(request.room, { type: "ex-place", seq: 7, side: "buy", symbol: "constructor", price: 10, qty: 1 })
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "result", seq: 7, result: { ok: false, reason: "TOO_FAR" } })
  request.send.mockClear()
  await handleExchangeRequest(request.room, { type: "ex-look", symbol: "log" })
  expect(request.send).not.toHaveBeenCalled()
  expect(rpc.exchange).not.toHaveBeenCalled()
})

it("routes a valid board query to the exchange without a player command", async () => {
  const request = fixture()
  const view: ExchangeView = { book: { bids: [], asks: [] }, history: [], mine: [], inbox: { gold: 0, items: [] }, last: [] }
  const look = vi.fn(async () => view)
  rpc.exchange.mockReturnValue({ look })
  rpc.player.mockReturnValue({})
  await handleExchangeRequest(request.room, { type: "ex-look", symbol: "log" })
  expect(rpc.exchange).toHaveBeenCalledExactlyOnceWith("world")
  expect(rpc.player).toHaveBeenCalledExactlyOnceWith("buyer")
  expect(look).toHaveBeenCalledExactlyOnceWith("log", "buyer")
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "exchange", symbol: "log", view })
})
