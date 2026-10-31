import { afterEach, expect, it, vi } from "vitest"
import { getPartyInvitationRejection } from "#/world/server/map-room/get-party-invitation-rejection"
import { handlePartyInvite } from "#/world/server/map-room/handle-party-invite"
import { handlePartyLeave } from "#/world/server/map-room/handle-party-leave"
import { handlePartyMode } from "#/world/server/map-room/handle-party-mode"
import { PARTY_MAX } from "#/world/core/party/rules"
import { newPlayer } from "#/world/core/new-player"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Member, Party } from "#/world/core/party/types"
import type { Presence } from "#/world/server/map-room/presence"
import type { ServerMessage } from "#/world/protocol"

const rpc = vi.hoisted(() => ({ party: vi.fn(), player: vi.fn() }))
vi.mock("#/durable-objects/party", () => ({ Party: { get: rpc.party } }))
vi.mock("#/durable-objects/player", () => ({ Player: { get: rpc.player } }))
afterEach(() => vi.resetAllMocks())

function fixture() {
  const trace: string[] = []
  const me: Presence = { owner: "owner", player: mapPlayer("sender", newPlayer("sender"), [0, 0]), route: [[0, 0]], since: 0, said: [], engaged: null, party: "group" }
  const peer = {
    id: "peer",
    state: { ...me, party: null },
    send: vi.fn(async (_message: ServerMessage) => {
      trace.push("invite")
    }),
  }
  const send = vi.fn(async (message: ServerMessage) => {
    trace.push(message.type)
  })
  const save = vi.fn((_patch: Partial<Presence>) => {
    trace.push("save")
  })
  const party: Party = { leader: "owner", mode: "own", members: [] }
  const view = vi.fn(async () => party)
  const leave = vi.fn(async () => {
    trace.push("leave")
  })
  const setMode = vi.fn(async () => party)
  const run = vi.fn(async () => {
    trace.push("run")
    return { ok: true, state: newPlayer(), events: [] }
  })
  rpc.party.mockReturnValue({ view, leave, setMode })
  rpc.player.mockReturnValue({ run })
  const room = { me, save, ctx: { connection: { id: "sender", send }, room: { getConnection: () => peer } } }
  return { room, me, peer, send, save, party, view, leave, setMode, run, trace }
}

it("checks leadership before fullness", () => {
  const member: Member = { owner: "owner", name: "member", level: 1, hp: 1, maxHp: 1, map: "map", at: 0 }
  const members = Array.from({ length: PARTY_MAX }, () => member)
  expect(getPartyInvitationRejection({ leader: "other", members }, "owner")).toBe("NOT_LEADER")
  expect(getPartyInvitationRejection({ leader: "owner", members }, "owner")).toBe("FULL")
  expect(getPartyInvitationRejection({ leader: "owner", members: members.slice(1) }, "owner")).toBeNull()
})

it("saves an invitation before sending it without enrolling the peer", async () => {
  const request = fixture()
  await handlePartyInvite(request.room, { type: "party-invite", target: "peer" })
  expect(request.trace).toEqual(["save", "invite"])
  expect(request.save).toHaveBeenCalledExactlyOnceWith({ inviting: "peer" })
  expect(request.peer.state.party).toBeNull()
  expect(rpc.player).not.toHaveBeenCalled()
})

it("rejects a non-leader before saving or sending an invitation", async () => {
  const request = fixture()
  request.party.leader = "other"
  await handlePartyInvite(request.room, { type: "party-invite", target: "peer" })
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "party-closed", reason: "NOT_LEADER" })
  expect(request.save).not.toHaveBeenCalled()
  expect(request.peer.send).not.toHaveBeenCalled()
})

it("leaves the saved party before clearing presence and publishing the player", async () => {
  const request = fixture()
  await handlePartyLeave(request.room, { type: "party-leave" })
  expect(request.trace).toEqual(["leave", "save", "run", "result", "party"])
  expect(request.leave).toHaveBeenCalledExactlyOnceWith("owner")
  expect(request.run).toHaveBeenCalledExactlyOnceWith({ type: "set-party", party: null })
  expect(request.send).toHaveBeenLastCalledWith({ type: "party", view: null })
})

it("returns the saved mode without changing player membership", async () => {
  const request = fixture()
  request.party.mode = "even"
  await handlePartyMode(request.room, { type: "party-mode", mode: "even" })
  expect(request.setMode).toHaveBeenCalledExactlyOnceWith("owner", "even")
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "party", view: { mode: "even", leading: true, members: [] } })
  expect(request.run).not.toHaveBeenCalled()
  expect(request.save).not.toHaveBeenCalled()
})
