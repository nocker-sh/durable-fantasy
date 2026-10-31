import { expect, it, vi } from "vitest"
import { newPlayer } from "#/world/core/new-player"
import { placeExchangeOrder } from "#/world/server/map-room/place-exchange-order"
import { cancelExchangeOrder } from "#/world/server/map-room/cancel-exchange-order"
import { claimExchangeInbox } from "#/world/server/map-room/claim-exchange-inbox"
import { sendExchangeBoard } from "#/world/server/map-room/send-exchange-board"
import type { ExchangeRequestContext } from "#/world/server/map-room/exchange-request-types"
import type { ExchangeView, ServerMessage } from "#/world/protocol"
import type { Transition } from "#/world/core/transition"
import type { Message } from "#/world/server/map-room/context"

type BeginResult = Awaited<ReturnType<ExchangeRequestContext["exchange"]["beginOrder"]>>
const order: Message<"ex-place"> = { type: "ex-place", seq: 7, side: "buy", symbol: "log", price: 10, qty: 1 }

function fixture() {
  const trace: string[] = []
  const state = newPlayer()
  const result: Transition = { ok: true, state, events: [] }
  const view: ExchangeView = { book: { bids: [], asks: [] }, history: [], mine: [], inbox: { gold: 0, items: [] }, last: [] }
  const beginOrder = vi.fn(async (): Promise<BeginResult> => {
    trace.push("begin")
    return { ok: true, id: 11 }
  })
  const place = vi.fn(async (): Promise<Transition> => {
    trace.push("place")
    return result
  })
  const cancel = vi.fn(async () => {
    trace.push("cancel")
    return true
  })
  const reserveInbox = vi.fn(async () => {
    trace.push("reserve")
    return { id: 12, inbox: { gold: 0, items: [] } }
  })
  const deliverInbox = vi.fn(async (): Promise<Transition> => {
    trace.push("deliver")
    return result
  })
  const look = vi.fn(async () => {
    trace.push("look")
    return view
  })
  const read = vi.fn(async () => {
    trace.push("read")
    return state
  })
  const send = vi.fn(async (message: ServerMessage) => {
    trace.push(message.type)
  })
  const context: ExchangeRequestContext = {
    owner: "buyer",
    name: "買い手",
    connection: { id: "connection", send },
    exchange: { beginOrder, place, cancel, reserveInbox, deliverInbox, look },
    player: { read },
  }
  return { trace, state, result, view, beginOrder, place, cancel, reserveInbox, deliverInbox, look, read, send, context }
}

it("reserves and places before replying, then refreshes the board", async () => {
  const request = fixture()
  await placeExchangeOrder(request.context, order)
  expect(request.trace).toEqual(["begin", "place", "result", "look", "exchange"])
  expect(request.place).toHaveBeenCalledExactlyOnceWith("buyer", 11)
  expect(request.look).toHaveBeenCalledExactlyOnceWith("log", "buyer")
})

it("replies to rejected reservations and placements without reading the board", async () => {
  const reservation = fixture()
  reservation.beginOrder.mockImplementationOnce(async () => {
    reservation.trace.push("begin")
    return { ok: false, reason: "NOT_READY" }
  })
  await placeExchangeOrder(reservation.context, order)
  expect(reservation.trace).toEqual(["begin", "result"])
  expect(reservation.place).not.toHaveBeenCalled()
  expect(reservation.look).not.toHaveBeenCalled()
  const placement = fixture()
  placement.place.mockImplementationOnce(async () => {
    placement.trace.push("place")
    return { ok: false, reason: "NOT_READY" }
  })
  await placeExchangeOrder(placement.context, order)
  expect(placement.trace).toEqual(["begin", "place", "result"])
  expect(placement.look).not.toHaveBeenCalled()
})

it("propagates a lost result notification after placement without querying the board", async () => {
  const request = fixture()
  request.send.mockRejectedValue(Error("Socket unavailable"))
  await expect(placeExchangeOrder(request.context, order)).rejects.toThrow("Socket unavailable")
  expect(request.place).toHaveBeenCalledOnce()
  expect(request.look).not.toHaveBeenCalled()
})

it("only reads confirmed player state after cancellation succeeds", async () => {
  const rejected = fixture()
  rejected.cancel.mockResolvedValue(false)
  await cancelExchangeOrder(rejected.context, { type: "ex-cancel", seq: 8, id: "order" })
  expect(rejected.read).not.toHaveBeenCalled()
  expect(rejected.send).toHaveBeenCalledExactlyOnceWith({ type: "result", seq: 8, result: { ok: false, reason: "NOT_READY" } })
  const accepted = fixture()
  await cancelExchangeOrder(accepted.context, { type: "ex-cancel", seq: 8, id: "order" })
  expect(accepted.trace).toEqual(["cancel", "read", "result"])
  expect(accepted.look).not.toHaveBeenCalled()
})

it("uses the reserved inbox identity for delivery before acknowledging it", async () => {
  const request = fixture()
  await claimExchangeInbox(request.context, { type: "ex-claim", seq: 9 })
  expect(request.trace).toEqual(["reserve", "deliver", "result"])
  expect(request.deliverInbox).toHaveBeenCalledExactlyOnceWith("buyer", 12)
  expect(request.look).not.toHaveBeenCalled()
})

it("sends a board query without a player command result", async () => {
  const request = fixture()
  await sendExchangeBoard(request.context, "log")
  expect(request.trace).toEqual(["look", "exchange"])
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "exchange", symbol: "log", view: request.view })
})
