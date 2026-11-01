import { afterEach, expect, it, vi } from "vitest"
import { handlePartyMember } from "#/world/server/map-room/handle-party-member"
import type { Presence } from "#/world/server/map-room/presence"
import type { Member, Party } from "#/world/core/party/types"
import type { ServerMessage } from "#/world/protocol"

const rpc = vi.hoisted(() => ({ party: vi.fn(), player: vi.fn() }))
vi.mock("#/durable-objects/party", () => ({ Party: { get: rpc.party } }))
vi.mock("#/durable-objects/player", () => ({ Player: { get: rpc.player } }))
afterEach(() => vi.resetAllMocks())

const member = (owner: string): Member => ({ owner, name: owner.toUpperCase(), level: 1, hp: 1, maxHp: 1, map: "広場", at: Date.now() })

function fixture() {
  const party: Party = { leader: "a", mode: "own", members: [member("a"), member("b"), member("c")] }
  const me: Presence = { owner: "a", party: "group", player: null, route: [], since: 0, said: [], engaged: null }
  const send = vi.fn(async (_message: ServerMessage) => {})
  const kick = vi.fn(async () => ({ ...party, members: [party.members[0], party.members[2]] }))
  const promote = vi.fn(async () => ({ ...party, leader: "b" }))
  rpc.party.mockReturnValue({ view: async () => party, kick, promote })
  const room = { me, save: vi.fn(), ctx: { connection: { send } } }
  return { room, send, kick, promote }
}

it("removes the member at that place only when the name still matches", async () => {
  const request = fixture()
  await handlePartyMember(request.room, { type: "party-kick", member: 1, name: "B" })
  expect(request.kick).toHaveBeenCalledExactlyOnceWith({ leader: "a", target: "b" })
  expect(request.send).toHaveBeenCalledWith(expect.objectContaining({ type: "party" }))
  const moved = fixture()
  await handlePartyMember(moved.room, { type: "party-kick", member: 1, name: "C" })
  expect(moved.kick).not.toHaveBeenCalled()
  expect(moved.send).toHaveBeenCalledExactlyOnceWith({ type: "party-closed", reason: "CHANGED" })
})

it("hands the lead over and tells the old leader they no longer lead", async () => {
  const request = fixture()
  await handlePartyMember(request.room, { type: "party-lead", member: 1, name: "B" })
  expect(request.promote).toHaveBeenCalledExactlyOnceWith({ leader: "a", target: "b" })
  expect(request.send).toHaveBeenCalledWith({ type: "party", view: expect.objectContaining({ leading: false }) })
})
