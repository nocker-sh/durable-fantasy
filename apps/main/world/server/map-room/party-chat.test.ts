import { afterEach, beforeEach, expect, it, vi } from "vitest"
import type { Player } from "#/durable-objects/player"
import type { Party } from "#/durable-objects/party"
const calls = vi.hoisted(() => ({ read: vi.fn<ReturnType<typeof Player.get>["read"]>(), say: vi.fn<ReturnType<typeof Party.get>["say"]>(), chat: vi.fn<ReturnType<typeof Party.get>["chat"]>() }))
vi.mock("#/durable-objects/player", () => ({ Player: { get: () => calls } }))
vi.mock("#/durable-objects/party", () => ({ Party: { get: () => calls } }))
import { handlePartySpeech } from "#/world/server/map-room/handle-party-speech"
import { deliverPartyChat } from "#/world/server/map-room/deliver-party-chat"
import type { Presence } from "#/world/server/map-room/presence"
import type { ServerMessage } from "#/world/protocol"
import { newPlayer } from "#/world/core/new-player"
import { mapPlayer } from "#/world/server/map-room/map-player"
function fixture() {
  const send = vi.fn(async (_message: ServerMessage) => {})
  const me: Presence = { owner: "self", party: "group", player: mapPlayer("connection", newPlayer("エルナ"), [0, 0]), route: [[0, 0]], since: 0, said: [], engaged: null }
  const context = { me, ctx: { connection: { state: me, send } } }
  return { context, send }
}
beforeEach(() => vi.resetAllMocks())
it("rejects a stale connection membership before delivering or storing private speech", async () => {
  calls.read.mockResolvedValue({ ...newPlayer(), party: null })
  const f = fixture()
  await handlePartySpeech(f.context, { type: "party-say", text: "内緒" })
  expect(calls.say).not.toHaveBeenCalled()
  expect(calls.chat).not.toHaveBeenCalled()
  expect(f.send).toHaveBeenCalledWith({ type: "refused", what: "party-chat", reason: "NOT_MEMBER" })
})
it("leaves membership validation with the party and strips owner identifiers from delivery", async () => {
  calls.read.mockResolvedValue({ ...newPlayer(), party: "group" })
  calls.say.mockResolvedValue(null)
  calls.chat.mockResolvedValue({ seq: 7, lines: [{ seq: 7, owner: "self", name: "エルナ", text: "内緒", at: 1000 }] })
  const f = fixture()
  await handlePartySpeech(f.context, { type: "party-say", text: "内緒", chat: { party: "old-group", seq: 999 } })
  expect(calls.chat).toHaveBeenCalledWith("self", 0)
  expect(f.send).toHaveBeenCalledWith({ type: "party-chat", party: "group", seq: 7, lines: [{ seq: 7, name: "エルナ", text: "内緒", self: true }] })
  calls.chat.mockResolvedValue(null)
  f.send.mockClear()
  await deliverPartyChat(f.context)
  expect(f.send).not.toHaveBeenCalled()
})

afterEach(() => vi.restoreAllMocks())

it.each(["owner", "player"])("does not access saved state without a participating %s", async (missing) => {
  const request = fixture()
  if (missing === "owner") request.context.me.owner = null
  else request.context.me.player = null
  await handlePartySpeech(request.context, { type: "party-say", text: "内緒" })
  expect(calls.read).not.toHaveBeenCalled()
  expect(calls.say).not.toHaveBeenCalled()
  expect(request.send).not.toHaveBeenCalled()
})

it("does not fetch private history after the party refuses the message", async () => {
  const request = fixture()
  calls.read.mockResolvedValue({ ...newPlayer(), party: "group" })
  calls.say.mockResolvedValue("RATE_LIMIT")
  await handlePartySpeech(request.context, { type: "party-say", text: "内緒" })
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "refused", what: "party-chat", reason: "RATE_LIMIT" })
  expect(calls.chat).not.toHaveBeenCalled()
})

it("handles a lost refusal notification without accessing party history", async () => {
  const request = fixture()
  vi.spyOn(console, "warn").mockImplementation(() => {})
  calls.read.mockResolvedValue({ ...newPlayer(), party: null })
  request.send.mockRejectedValue(Error("Disconnected"))
  await expect(handlePartySpeech(request.context, { type: "party-say", text: "内緒" })).resolves.toBeUndefined()
  expect(calls.chat).not.toHaveBeenCalled()
  expect(calls.say).not.toHaveBeenCalled()
  expect(console.warn).toHaveBeenCalledOnce()
})

it("does not deliver private history to a closed connection", async () => {
  const request = fixture()
  request.context.me.closed = true
  calls.chat.mockResolvedValue({ seq: 7, lines: [{ seq: 7, owner: "self", name: "エルナ", text: "内緒", at: 1000 }] })
  await deliverPartyChat(request.context, { party: "group", seq: 6 })
  expect(calls.chat).toHaveBeenCalledExactlyOnceWith("self", 6)
  expect(request.send).not.toHaveBeenCalled()
})
