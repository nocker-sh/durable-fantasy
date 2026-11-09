import { afterEach, expect, it, vi } from "vitest"
import type { VoidSocket } from "void/ws"
import { Party } from "#/durable-objects/party"
import { Player } from "#/durable-objects/player"
import { GameSession } from "#/world/client/game-session"
import { SocialActions } from "#/world/client/social"
import { derive } from "#/world/core/derive"
import { emptyPartyChat } from "#/world/core/empty-party-chat"
import { newPlayer } from "#/world/core/new-player"
import { emptyParty } from "#/world/core/party/empty-party"
import { clientMessage } from "#/world/protocol"
import type { ClientMessage, ServerMessage } from "#/world/protocol"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { handlePartyLeave } from "#/world/server/map-room/handle-party-leave"
import { handlePartyMember } from "#/world/server/map-room/handle-party-member"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { sendPartyView } from "#/world/server/map-room/send-party-view"
import { setPresence } from "#/world/server/map-room/set-presence"
import type { Presence } from "#/world/server/map-room/presence"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

async function fixture(sameName = true) {
  vi.useFakeTimers()
  vi.setSystemTime(100_000)
  const store = durableStorage({ party: emptyParty(), chat: emptyPartyChat() }, 0)
  const actor = new Party.class(store.state, {})
  const parties = new Map([["group", actor]])
  vi.spyOn(Party, "get").mockImplementation((id: unknown) => {
    const found = parties.get(String(id))
    if (!found) throw new Error("Unexpected party")
    return found as unknown as ReturnType<typeof Party.get>
  })
  const members = [
    { owner: "owner-a", name: "Leader" },
    { owner: "owner-b", name: "Twin" },
    { owner: "owner-c", name: sameName ? "Twin" : "Other" },
    { owner: "owner-d", name: "Last" },
  ]
  for (const entry of members) {
    const player = newPlayer(entry.name)
    await actor.join({ ...entry, level: player.level, hp: player.hp, maxHp: derive(player).maxHp, map: "広場", at: Date.now() })
  }
  const connection = {
    id: "leader-connection",
    state: { owner: "owner-a", party: "group", player: mapPlayer("leader", newPlayer("Leader"), [10, 10]), route: [[10, 10]], since: Date.now(), said: [], engaged: null } as Presence,
    send: vi.fn(async (_message: ServerMessage) => {}),
    setState(next: Presence) {
      connection.state = next
    },
  }
  const room = {
    get me() {
      return connection.state
    },
    save: (patch: Partial<Presence>) => setPresence(connection, patch),
    ctx: { connection },
  }
  const publish = async () => {
    await sendPartyView({ connection, party: await actor.view(), partyId: "group", owner: "owner-a" })
    const message = connection.send.mock.calls.at(-1)?.[0]
    if (message?.type !== "party" || !message.view) throw new Error("Expected an actual published party view")
    for (const entry of members) expect(JSON.stringify(message.view)).not.toContain(entry.owner)
    return message.view
  }
  const view = await publish()
  connection.send.mockClear()
  const session = new GameSession()
  session.state.set({ ...session.state.get(), party: view })
  const sent: ClientMessage[] = []
  session.socket = {
    send: (message: ClientMessage) => {
      sent.push(clientMessage.parse(message))
    },
  } as unknown as VoidSocket<"/map/:mapId">
  const actions = new SocialActions({ session, update: vi.fn(), notify: vi.fn(), enterMap: vi.fn(), addChat: vi.fn(), getScene: () => null })
  const leavingPlayer = { ...newPlayer("Twin"), party: "group" }
  const leavingStore = durableStorage({ ...initialPlayerRecord(), player: leavingPlayer }, 8)
  const leavingActor = new Player.class(leavingStore.state, {})
  const leaderStore = durableStorage({ ...initialPlayerRecord(), player: { ...newPlayer("Leader"), party: "group" } }, 8)
  const leaderActor = new Player.class(leaderStore.state, {})
  vi.spyOn(Player, "get").mockImplementation((owner: unknown) => {
    if (owner === "owner-a") return leaderActor as unknown as ReturnType<typeof Player.get>
    if (owner === "owner-b") return leavingActor as unknown as ReturnType<typeof Player.get>
    throw new Error("Unexpected player")
  })
  const other = {
    state: { ...connection.state, owner: "owner-b", player: mapPlayer("leaving", leavingPlayer, [10, 10]) } as Presence,
    send: vi.fn(async (_message: ServerMessage) => {}),
    setState(next: Presence) {
      other.state = next
    },
  }
  const leaveSelected = async () => {
    await handlePartyLeave({ me: other.state, save: (patch) => setPresence(other, patch), ctx: { connection: other } }, { type: "party-leave" })
    expect(other.state.party).toBeNull()
    expect((await new Player.class(leavingStore.state, {}).read()).party).toBeNull()
  }
  const select = (kind: "kick" | "lead") => {
    const member = view.members[1]
    if (kind === "kick") actions.kickPartyMember(1, member.name, member.key)
    else actions.passPartyLead(1, member.name, member.key)
    const message = sent.at(-1)
    if (message?.type !== "party-kick" && message?.type !== "party-lead") throw new Error("The actual controller must send a member selection")
    return message
  }
  return { store, actor, parties, view, connection, room, select, leaveSelected, publish }
}

it.each(["kick", "lead"] as const)("does not %s a different same-name member after the selected row leaves", async (kind) => {
  const f = await fixture()
  const selected = f.select(kind)
  await f.leaveSelected()
  const before = await f.actor.view()
  expect(before.members.map((member) => member.owner)).toEqual(["owner-a", "owner-c", "owner-d"])
  await handlePartyMember(f.room, selected)
  expect(await f.actor.view()).toEqual(before)
  expect(await new Party.class(f.store.state, {}).view()).toEqual(before)
  expect(f.connection.send).toHaveBeenCalledExactlyOnceWith({ type: "party-closed", reason: "CHANGED" })
})

it.each(["kick", "lead"] as const)("keeps the existing changed-name guard when a selected member leaves before %s", async (kind) => {
  const f = await fixture(false)
  const selected = f.select(kind)
  await f.leaveSelected()
  const before = await f.actor.view()
  await handlePartyMember(f.room, selected)
  expect(await f.actor.view()).toEqual(before)
  expect(f.connection.send).toHaveBeenCalledExactlyOnceWith({ type: "party-closed", reason: "CHANGED" })
})

it.each(["kick", "lead"] as const)("still applies %s to the actual selected member when the roster is unchanged", async (kind) => {
  const f = await fixture()
  await handlePartyMember(f.room, f.select(kind))
  const after = await f.actor.view()
  expect(after.members.map((member) => member.owner)).toEqual(kind === "kick" ? ["owner-a", "owner-c", "owner-d"] : ["owner-a", "owner-b", "owner-c", "owner-d"])
  expect(after.leader).toBe(kind === "kick" ? "owner-a" : "owner-b")
  expect(f.connection.send).toHaveBeenCalledWith({ type: "party", view: expect.objectContaining({ leading: kind === "kick" }) })
})

it.each([undefined, "not-published"])("rejects an absent or unknown selection key (%s) without changing the party", async (key) => {
  const f = await fixture()
  const before = await f.actor.view()
  const selected = clientMessage.parse({ ...f.select("kick"), key })
  if (selected.type !== "party-kick") throw new Error("Expected a parsed kick request")
  await handlePartyMember(f.room, selected)
  expect(await f.actor.view()).toEqual(before)
  expect(f.connection.send).toHaveBeenCalledExactlyOnceWith({ type: "party-closed", reason: "CHANGED" })
})

it.each(["kick", "lead"] as const)("keeps the existing role rejection for a valid selection by a non-leader (%s)", async (kind) => {
  const f = await fixture()
  const selected = f.select(kind)
  await f.actor.promote({ leader: "owner-a", target: "owner-c" })
  const before = await f.actor.view()
  await handlePartyMember(f.room, selected)
  expect(await f.actor.view()).toEqual(before)
  expect(f.connection.send).toHaveBeenCalledExactlyOnceWith({ type: "party-closed", reason: "NOT_LEADER" })
})

it.each(["kick", "lead"] as const)("preserves a same-owner selection across real status polls (%s)", async (kind) => {
  const f = await fixture()
  const selected = f.select(kind)
  const member = (await f.actor.view()).members[1]
  await f.actor.poll({ owner: member.owner, status: { ...member, hp: member.hp - 1, map: "南門", at: Date.now() + 1000 }, after: 0 })
  const refreshed = await f.publish()
  expect(refreshed.members[1]).toEqual({ ...f.view.members[1], hp: member.hp - 1, map: "南門" })
  expect(f.connection.state.partySelection?.members[1].key).toBe(selected.key)
  f.connection.send.mockClear()
  await handlePartyMember(f.room, selected)
  const after = await f.actor.view()
  expect(after.members.some((entry) => entry.owner === "owner-b")).toBe(kind === "lead")
  expect(after.leader).toBe(kind === "lead" ? "owner-b" : "owner-a")
})

it.each(["kick", "lead"] as const)("does not reuse a departed owner's key for a same-name arrival (%s)", async (kind) => {
  const f = await fixture()
  const selected = f.select(kind)
  await f.leaveSelected()
  const member = (await f.actor.view()).members[1]
  expect(await f.actor.join({ ...member, owner: "owner-e", name: "Twin" })).toBe(true)
  const refreshed = await f.publish()
  expect(refreshed.members.every((entry) => entry.key !== selected.key)).toBe(true)
  const before = await f.actor.view()
  f.connection.send.mockClear()
  await handlePartyMember(f.room, { ...selected, member: 3 })
  expect(await f.actor.view()).toEqual(before)
  expect(f.connection.send).toHaveBeenCalledExactlyOnceWith({ type: "party-closed", reason: "CHANGED" })
})

it.each(["kick", "lead"] as const)("does not reuse an old key after an empty view and a different party (%s)", async (kind) => {
  const f = await fixture()
  const selected = f.select(kind)
  await handlePartyLeave(f.room, { type: "party-leave" })
  expect(f.connection.state.party).toBeNull()
  expect(f.connection.send).toHaveBeenLastCalledWith({ type: "party", view: null })
  const store = durableStorage({ party: emptyParty(), chat: emptyPartyChat() }, 0)
  const next = new Party.class(store.state, {})
  f.parties.set("next-group", next)
  const original = f.view.members[1]
  for (const member of [
    { owner: "owner-a", name: "Leader" },
    { owner: "owner-e", name: "Twin" },
    { owner: "owner-f", name: "Last" },
  ]) {
    expect(await next.join({ ...member, level: original.level, hp: original.hp, maxHp: original.maxHp, map: original.map, at: Date.now() })).toBe(true)
  }
  // The following publication starts from an explicitly prepared second-party membership.
  setPresence(f.connection, { party: "next-group" })
  await sendPartyView({ connection: f.connection, party: await next.view(), partyId: "next-group", owner: "owner-a" })
  const nextMessage = f.connection.send.mock.calls.at(-1)?.[0]
  if (nextMessage?.type !== "party" || !nextMessage.view) throw new Error("Expected the new party view")
  expect(nextMessage.view.members.every((member) => !f.view.members.some((old) => old.key === member.key))).toBe(true)
  const before = await next.view()
  f.connection.send.mockClear()
  await handlePartyMember(f.room, selected)
  expect(await next.view()).toEqual(before)
  expect(f.connection.send).toHaveBeenCalledExactlyOnceWith({ type: "party-closed", reason: "CHANGED" })
})

it.each(["recipient", "connection"] as const)("does not reuse selection keys for another %s", async (change) => {
  const f = await fixture()
  const selected = f.select("kick")
  const connection = {
    ...f.connection,
    id: change === "connection" ? "new-connection" : f.connection.id,
    state: { ...f.connection.state, owner: change === "recipient" ? "owner-c" : "owner-a" } as Presence,
    send: vi.fn(async (_message: ServerMessage) => {}),
    setState(next: Presence) {
      connection.state = next
    },
  }
  await sendPartyView({ connection, party: await f.actor.view(), partyId: "group", owner: connection.state.owner! })
  const published = connection.send.mock.calls.at(-1)?.[0]
  if (published?.type !== "party" || !published.view) throw new Error("Expected the recipient's party view")
  expect(published.view.members.every((member) => !f.view.members.some((old) => old.key === member.key))).toBe(true)
  const before = await f.actor.view()
  connection.send.mockClear()
  await handlePartyMember({ me: connection.state, save: (patch) => setPresence(connection, patch), ctx: { connection } }, selected)
  expect(await f.actor.view()).toEqual(before)
  expect(connection.send).toHaveBeenCalledExactlyOnceWith({ type: "party-closed", reason: "CHANGED" })
})
