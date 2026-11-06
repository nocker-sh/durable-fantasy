import { afterEach, expect, it, vi } from "vitest"
import { handlePartyAnswer } from "#/world/server/map-room/handle-party-answer"
import { newPlayer } from "#/world/core/new-player"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Presence } from "#/world/server/map-room/presence"
import type { Member, Party } from "#/world/core/party/types"
import type { ServerMessage } from "#/world/protocol"

const rpc = vi.hoisted(() => ({ player: vi.fn(), party: vi.fn() }))
vi.mock("#/durable-objects/player", () => ({ Player: { get: rpc.player } }))
vi.mock("#/durable-objects/party", () => ({ Party: { get: rpc.party } }))
afterEach(() => vi.resetAllMocks())

function fixture() {
  const trace: string[] = []
  const guest: Presence = { owner: "guest-owner", player: mapPlayer("guest", newPlayer("Guest"), [0, 0]), route: [[0, 0]], since: 0, said: [], engaged: null }
  const host: Presence = { ...guest, owner: "host-owner", player: mapPlayer("host", newPlayer("Host"), [0, 0]), inviting: "guest", party: "group" }
  const peer = {
    id: "host",
    state: host,
    send: vi.fn(async (message: ServerMessage) => {
      trace.push("host-" + message.type)
    }),
    setState(next: Presence) {
      peer.state = next
      trace.push("host-state")
    },
  }
  const send = vi.fn(async (message: ServerMessage) => {
    trace.push("guest-" + message.type)
  })
  const save = vi.fn((patch: Partial<Presence>) => {
    Object.assign(guest, patch)
    trace.push("guest-state")
  })
  const connection = {
    id: "guest",
    state: guest,
    send,
    setState(next: Presence) {
      Object.assign(guest, next)
      connection.state = guest
      trace.push("guest-state")
    },
  }
  const room = { me: guest, save, map: { name: "広場" }, ctx: { connection, room: { getConnection: () => peer } } }
  const join = vi.fn(async (member: Member) => {
    trace.push("join-" + member.owner)
    return true
  })
  const party: Party = { leader: "host-owner", mode: "own", members: [] }
  const view = vi.fn(async () => {
    trace.push("view")
    return party
  })
  rpc.party.mockReturnValue({ join, view })
  rpc.player.mockImplementation((owner: string) => ({
    read: async () => {
      trace.push("read-" + owner)
      return newPlayer()
    },
    run: async () => {
      trace.push("run-" + owner)
      return { ok: true, state: newPlayer(), events: [] }
    },
  }))
  return { guest, host, peer, room, send, save, join, view, trace }
}

it("ignores a response to an invitation that is no longer pending", async () => {
  const request = fixture()
  request.host.inviting = "other"
  await handlePartyAnswer(request.room, { type: "party-answer", from: "host", yes: true })
  expect(request.trace).toEqual([])
  expect(rpc.party).not.toHaveBeenCalled()
  expect(rpc.player).not.toHaveBeenCalled()
})

it.each(["declined", "already-member"])("consumes the invitation without enrollment when %s", async (reason) => {
  const request = fixture()
  if (reason === "already-member") request.guest.party = "another-group"
  await handlePartyAnswer(request.room, { type: "party-answer", from: "host", yes: reason !== "declined" })
  expect(request.peer.state.inviting).toBeUndefined()
  expect(request.peer.send).toHaveBeenCalledExactlyOnceWith({ type: "party-closed", reason: "DECLINED" })
  expect(rpc.party).not.toHaveBeenCalled()
  expect(rpc.player).not.toHaveBeenCalled()
})

it("joins an existing party before saving membership and sending each member's view", async () => {
  const request = fixture()
  await handlePartyAnswer(request.room, { type: "party-answer", from: "host", yes: true })
  expect(request.trace).toEqual([
    "host-state",
    "guest-state",
    "host-state",
    "view",
    "read-guest-owner",
    "join-guest-owner",
    "run-guest-owner",
    "guest-state",
    "guest-result",
    "view",
    "guest-state",
    "guest-party",
    "view",
    "host-state",
    "host-party",
    "guest-state",
    "host-state",
  ])
  expect(request.join).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ owner: "guest-owner", name: "Guest", map: "広場", hp: expect.any(Number), maxHp: expect.any(Number) }), "host-owner")
  expect(request.save).toHaveBeenCalledExactlyOnceWith({ party: "group" })
  expect(request.view).toHaveBeenCalledTimes(3)
})

it("registers the inviter before the guest when creating a new party", async () => {
  const request = fixture()
  request.host.party = null
  await handlePartyAnswer(request.room, { type: "party-answer", from: "host", yes: true })
  expect(request.trace).toEqual([
    "host-state",
    "guest-state",
    "host-state",
    "read-host-owner",
    "join-host-owner",
    "run-host-owner",
    "host-state",
    "host-result",
    "read-guest-owner",
    "join-guest-owner",
    "run-guest-owner",
    "guest-state",
    "guest-result",
    "view",
    "guest-state",
    "guest-party",
    "view",
    "host-state",
    "host-party",
    "guest-state",
    "host-state",
  ])
  expect(request.guest.party).toBeTruthy()
  expect(request.peer.state.party).toBe(request.guest.party)
})

it("does not save guest membership or send views when enrollment is refused", async () => {
  const request = fixture()
  request.join.mockResolvedValue(false)
  await handlePartyAnswer(request.room, { type: "party-answer", from: "host", yes: true })
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "party-closed", reason: "FULL" })
  expect(request.save).not.toHaveBeenCalled()
  expect(request.view).toHaveBeenCalledOnce()
  expect(request.trace).not.toContain("run-guest-owner")
})

it("propagates enrollment failure without inventing a membership change", async () => {
  const request = fixture()
  request.join.mockRejectedValue(Error("Unavailable"))
  await expect(handlePartyAnswer(request.room, { type: "party-answer", from: "host", yes: true })).rejects.toThrow("Unavailable")
  expect(request.save).not.toHaveBeenCalled()
  expect(request.send).not.toHaveBeenCalled()
  expect(request.view).toHaveBeenCalledOnce()
})

it("does not join a party whose inviter no longer leads it", async () => {
  const request = fixture()
  request.view.mockResolvedValue({ leader: "someone-else", mode: "own", members: [] })
  await handlePartyAnswer(request.room, { type: "party-answer", from: "host", yes: true })
  expect(request.peer.send).toHaveBeenCalledExactlyOnceWith({ type: "party-closed", reason: "NOT_LEADER" })
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "party-closed", reason: "CHANGED" })
  expect(request.join).not.toHaveBeenCalled()
  expect(request.save).not.toHaveBeenCalled()
})
