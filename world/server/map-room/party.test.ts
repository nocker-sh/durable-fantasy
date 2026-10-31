import { beforeEach, expect, it, vi } from "vitest"
import { handlePartyLook } from "#/world/server/map-room/handle-party-look"
import { player } from "#/world/test/player"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Presence } from "#/world/server/map-room/presence"
import type { ServerMessage } from "#/world/protocol"

const calls = vi.hoisted(() => ({ read: vi.fn(), poll: vi.fn(), chat: vi.fn(), run: vi.fn() }))
vi.mock("#/durable-objects/player", () => ({ Player: { get: () => calls } }))
vi.mock("#/durable-objects/party", () => ({ Party: { get: () => calls } }))
beforeEach(() => vi.resetAllMocks())

function fixture() {
  const trace: string[] = []
  const me: Presence = { owner: "self", party: "group", player: mapPlayer("connection", player({ name: "エルナ" }), [0, 0]), route: [[0, 0]], since: 0, said: [], engaged: null }
  calls.read.mockResolvedValue(player({ party: "group" }))
  calls.poll.mockResolvedValue({
    party: { leader: "self", mode: "own", members: [{ owner: "self", name: "エルナ", hp: 7, maxHp: 10, level: 1, map: "南門", at: 1000 }] },
    chat: { seq: 3, lines: [{ seq: 3, owner: "self", name: "エルナ", text: "待ち合わせ", at: 1000 }] },
  })
  calls.run.mockImplementation(async () => {
    trace.push("run")
    return { ok: true, state: player({ party: null }), events: [] }
  })
  const send = vi.fn(async (message: ServerMessage) => {
    trace.push(message.type)
  })
  const save = vi.fn((_patch: Partial<Presence>) => {
    trace.push("save")
  })
  const room = { me, save, map: { name: "南門" }, ctx: { connection: { state: me, send } } }
  return { me, send, save, room, trace }
}

it.each(["group", "previous-group"])("polls status and private speech once with a cursor for %s", async (cursorParty) => {
  const request = fixture()
  await handlePartyLook(request.room, { type: "party-look", chat: { party: cursorParty, seq: 2 } })
  expect(calls.poll).toHaveBeenCalledExactlyOnceWith({ owner: "self", status: expect.objectContaining({ name: "エルナ", map: "南門" }), after: cursorParty === "group" ? 2 : 0 })
  expect(calls.chat).not.toHaveBeenCalled()
  expect(request.send).toHaveBeenCalledWith({ type: "party-chat", party: "group", seq: 3, lines: [{ seq: 3, name: "エルナ", text: "待ち合わせ", self: true }] })
  expect(request.trace).toEqual(["party", "party-chat"])
})

it("returns an empty view without storage access when no party is present", async () => {
  const request = fixture()
  request.me.party = null
  await handlePartyLook(request.room, { type: "party-look" })
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "party", view: null })
  expect(calls.read).not.toHaveBeenCalled()
  expect(calls.poll).not.toHaveBeenCalled()
})

it("clears a missing membership before returning the saved player and empty view", async () => {
  const request = fixture()
  calls.poll.mockResolvedValue({ party: { leader: "other", mode: "own", members: [] }, chat: null })
  await handlePartyLook(request.room, { type: "party-look" })
  expect(request.trace).toEqual(["save", "run", "result", "party"])
  expect(request.save).toHaveBeenCalledExactlyOnceWith({ party: null })
  expect(calls.run).toHaveBeenCalledExactlyOnceWith({ type: "set-party", party: null })
  expect(request.send).toHaveBeenLastCalledWith({ type: "party", view: null })
})

it("does not forward private speech when the saved player belongs to another party", async () => {
  const request = fixture()
  calls.read.mockResolvedValue(player({ party: "other-group" }))
  await handlePartyLook(request.room, { type: "party-look" })
  expect(request.trace).toEqual(["party"])
  expect(request.save).not.toHaveBeenCalled()
})

it("does not erase membership after a failed poll", async () => {
  const request = fixture()
  calls.poll.mockRejectedValue(Error("Unavailable"))
  await expect(handlePartyLook(request.room, { type: "party-look" })).rejects.toThrow("Unavailable")
  expect(request.save).not.toHaveBeenCalled()
  expect(calls.run).not.toHaveBeenCalled()
  expect(request.send).not.toHaveBeenCalled()
})
