import { expect, it, vi } from "vitest"
import { sendToRoom } from "#/world/client/send-to-room"
import { parseChatInput } from "#/world/client/chat-input"
import { MAX_ORDER_PRICE } from "#/world/core/exchange-rules"
import { TRADE_GOLD_MAX, TRADE_LOTS } from "#/world/core/trade-rules"
import type { ClientMessage } from "#/world/protocol"

const lots = (n: number) => Array.from({ length: n }, (_, slot) => ({ slot, count: 1 }))

it("sends what the room's schema takes, as the schema reads it", () => {
  const socket = { send: vi.fn() }
  expect(sendToRoom(socket, { type: "trade-offer", lots: lots(TRADE_LOTS), gold: TRADE_GOLD_MAX })).toBe(true)
  expect(sendToRoom(socket, { type: "say", text: "  こんにちは " })).toBe(true)
  expect(socket.send.mock.calls).toEqual([[{ type: "trade-offer", lots: lots(TRADE_LOTS), gold: TRADE_GOLD_MAX }], [{ type: "say", text: "こんにちは" }]])
})

it.each<[string, ClientMessage]>([
  ["a ninth lot", { type: "trade-offer", lots: lots(TRADE_LOTS + 1), gold: 0 }],
  ["more gold than a side may put up", { type: "trade-offer", lots: [], gold: TRADE_GOLD_MAX + 1 }],
  ["a whisper to a name longer than any", { type: "whisper", to: "今日の夜に広場の噴水の前で待ってるね", text: "ハンスより" }],
  ["a price over the board's", { type: "ex-place", seq: 1, side: "sell", symbol: "log", price: MAX_ORDER_PRICE + 1, qty: 1, slot: 0 }],
  ["a join from an unreadable player id", { type: "join", player: "player", at: [1, 1] }],
])("keeps back %s, on which the room would close the socket", (_name, message) => {
  const socket = { send: vi.fn() }
  expect(sendToRoom(socket, message)).toBe(false)
  expect(socket.send).not.toHaveBeenCalled()
})

it("keeps back the whisper of a line typed without a space after the name", () => {
  const input = parseChatInput("/w 今日の夜に広場の噴水の前で待ってるね ハンスより")
  if (input?.kind !== "whisper") throw new Error("expected a whisper")
  const socket = { send: vi.fn() }
  expect(sendToRoom(socket, { type: "whisper", to: input.to, text: input.text })).toBe(false)
  expect(socket.send).not.toHaveBeenCalled()
})

it("sends nothing without a socket", () => {
  expect(sendToRoom(null, { type: "heartbeat" })).toBe(false)
})
