import { beforeEach, expect, it, vi } from "vitest"
const calls = vi.hoisted(() => ({ read: vi.fn(), poll: vi.fn(), chat: vi.fn(), run: vi.fn() }))
vi.mock("../../../durable-objects/player.ts", () => ({ Player: { get: () => calls } }))
vi.mock("../../../durable-objects/party.ts", () => ({ Party: { get: () => calls } }))
import { HANDLERS } from "./party.ts"
import { player } from "../../test/helpers.ts"
import type { Ctx } from "./context.ts"

beforeEach(() => vi.resetAllMocks())
it.each(["group", "previous-group"])("polls status and private speech once with a cursor for %s", async (cursorParty) => {
  calls.read.mockResolvedValue(player({ party: "group" }))
  calls.poll.mockResolvedValue({
    party: { leader: "self", mode: "own", members: [{ owner: "self", name: "エルナ", hp: 7, maxHp: 10, level: 1, map: "南門", at: 1000 }] },
    chat: { seq: 3, lines: [{ seq: 3, owner: "self", name: "エルナ", text: "待ち合わせ", at: 1000 }] },
  })
  const send = vi.fn(async () => {})
  const context = { me: { owner: "self", party: "group", player: { name: "エルナ" } }, map: { name: "南門" }, ctx: { connection: { state: {}, send } } } as unknown as Ctx
  await HANDLERS["party-look"]!(context, { type: "party-look", chat: { party: cursorParty, seq: 2 } })
  expect(calls.poll).toHaveBeenCalledExactlyOnceWith("self", expect.objectContaining({ name: "エルナ", map: "南門" }), cursorParty === "group" ? 2 : 0)
  expect(calls.chat).not.toHaveBeenCalled()
  expect(send).toHaveBeenCalledWith({ type: "party-chat", party: "group", seq: 3, lines: [{ seq: 3, name: "エルナ", text: "待ち合わせ", self: true }] })
  expect(send).toHaveBeenCalledWith(expect.objectContaining({ type: "party" }))
})
