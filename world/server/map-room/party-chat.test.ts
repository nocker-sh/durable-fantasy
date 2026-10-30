import { beforeEach, expect, it, vi } from "vitest"
const calls = vi.hoisted(() => ({ read: vi.fn(), say: vi.fn(), chat: vi.fn() }))
vi.mock("../../../durable-objects/player", () => ({ Player: { get: () => calls } }))
vi.mock("../../../durable-objects/party", () => ({ Party: { get: () => calls } }))
import { HANDLERS } from "#/world/server/map-room/party-chat"
import { deliverPartyChat } from "#/world/server/map-room/deliver-party-chat"
import type { Ctx } from "./context"
function fixture() {
  const send = vi.fn(async () => {})
  const context = { me: { owner: "self", party: "group", player: { name: "エルナ" } }, ctx: { connection: { state: {}, send } } } as unknown as Ctx
  return { context, send }
}
beforeEach(() => vi.resetAllMocks())
it("rejects a stale connection membership before delivering or storing private speech", async () => {
  calls.read.mockResolvedValue({ party: null })
  const f = fixture()
  await HANDLERS["party-say"]!(f.context, { type: "party-say", text: "内緒" })
  expect(calls.say).not.toHaveBeenCalled()
  expect(calls.chat).not.toHaveBeenCalled()
  expect(f.send).toHaveBeenCalledWith({ type: "refused", what: "party-chat", reason: "NOT_MEMBER" })
})
it("leaves membership validation with the party and strips owner identifiers from delivery", async () => {
  calls.read.mockResolvedValue({ party: "group" })
  calls.say.mockResolvedValue(null)
  calls.chat.mockResolvedValue({ seq: 7, lines: [{ seq: 7, owner: "self", name: "エルナ", text: "内緒", at: 1000 }] })
  const f = fixture()
  await HANDLERS["party-say"]!(f.context, { type: "party-say", text: "内緒", chat: { party: "old-group", seq: 999 } })
  expect(calls.chat).toHaveBeenCalledWith("self", 0)
  expect(f.send).toHaveBeenCalledWith({ type: "party-chat", party: "group", seq: 7, lines: [{ seq: 7, name: "エルナ", text: "内緒", self: true }] })
  calls.chat.mockResolvedValue(null)
  f.send.mockClear()
  await deliverPartyChat(f.context)
  expect(f.send).not.toHaveBeenCalled()
})
