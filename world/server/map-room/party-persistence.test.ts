import { afterEach, expect, it, vi } from "vitest"
import { Party } from "#/durable-objects/party"
import { Player } from "#/durable-objects/player"
import { derive } from "#/world/core/derive"
import { emptyPartyChat } from "#/world/core/empty-party-chat"
import { newPlayer } from "#/world/core/new-player"
import { emptyParty } from "#/world/core/party/empty-party"
import { PARTY_MAX } from "#/world/core/party/rules"
import type { Member } from "#/world/core/party/types"
import type { PlayerState } from "#/world/core/player-types"
import type { ServerMessage } from "#/world/protocol"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { handlePartyAnswer } from "#/world/server/map-room/handle-party-answer"
import { handlePartyInvite } from "#/world/server/map-room/handle-party-invite"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { setPresence } from "#/world/server/map-room/set-presence"
import type { Presence } from "#/world/server/map-room/presence"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

async function fixture(existing = false) {
  vi.useFakeTimers()
  vi.setSystemTime(100_000)
  const hostOwner = "00000000-0000-4000-8000-000000000001"
  const guestOwner = "00000000-0000-4000-8000-000000000002"
  const hostStore = durableStorage({ ...initialPlayerRecord(), player: newPlayer("Host") }, 8)
  const guestStore = durableStorage({ ...initialPlayerRecord(), player: newPlayer("Guest") }, 8)
  const hostActor = new Player.class(hostStore.state, {})
  const guestActor = new Player.class(guestStore.state, {})
  vi.spyOn(Player, "get").mockImplementation((owner: unknown) => {
    if (owner === hostOwner) return hostActor as unknown as ReturnType<typeof Player.get>
    if (owner === guestOwner) return guestActor as unknown as ReturnType<typeof Player.get>
    throw new Error("Unexpected player")
  })
  const parties = new Map<string, { store: ReturnType<typeof durableStorage>; actor: InstanceType<typeof Party.class> }>()
  function party(id: string) {
    if (!parties.has(id)) {
      const store = durableStorage({ party: emptyParty(), chat: emptyPartyChat() }, 0)
      parties.set(id, { store, actor: new Party.class(store.state, {}) })
    }
    return parties.get(id)!
  }
  vi.spyOn(Party, "get").mockImplementation((id: unknown) => party(String(id)).actor as unknown as ReturnType<typeof Party.get>)
  function connection(id: string, owner: string, name: string) {
    const socket = {
      id,
      state: { owner, player: mapPlayer(id, newPlayer(name), [10, 10]), route: [[10, 10]], since: Date.now(), said: [], engaged: null } as Presence,
      send: vi.fn(async (_message: ServerMessage) => {}),
      setState(state: Presence) {
        socket.state = state
      },
    }
    return socket
  }
  const host = connection("host", hostOwner, "Host")
  const guest = connection("guest", guestOwner, "Guest")
  const previousMember: Member = { owner: "old-owner", name: "Old", level: 3, hp: 7, maxHp: 90, map: "別の場所", at: Date.now() - 1000 }
  if (existing) {
    const group = party("existing-group").actor
    const player = await hostActor.read()
    await group.join({ owner: hostOwner, name: player.name, level: player.level, hp: player.hp, maxHp: derive(player).maxHp, map: "広場", at: Date.now() })
    await group.join(previousMember)
    await group.setMode(hostOwner, "even")
    await hostActor.run({ type: "set-party", party: "existing-group" })
    setPresence(host, { party: "existing-group" })
  }
  await guestActor.read()
  const askRoom = {
    me: host.state,
    save: (patch: Partial<Presence>) => setPresence(host, patch),
    ctx: { connection: host, room: { getConnection: (id: string) => (id === guest.id ? guest : undefined) } },
  }
  await handlePartyInvite(askRoom, { type: "party-invite", target: guest.id })
  expect(host.state.inviting).toBe(guest.id)
  expect(guest.send).toHaveBeenCalledWith({ type: "party-invited", from: host.id, name: "Host" })
  host.send.mockClear()
  guest.send.mockClear()
  const room = {
    get me() {
      return guest.state
    },
    save: (patch: Partial<Presence>) => setPresence(guest, patch),
    map: { name: "広場" },
    ctx: { connection: guest, room: { getConnection: (id: string) => (id === host.id ? host : undefined) } },
  }
  const answer = (yes = true) => handlePartyAnswer(room, { type: "party-answer", from: host.id, yes })
  const stored = (store: ReturnType<typeof durableStorage>) => (store.saved.get("__void_durable_state") as { value: { player: PlayerState } }).value.player
  const saved = () => ({ host: structuredClone(stored(hostStore)), guest: structuredClone(stored(guestStore)) })
  return { host, guest, hostOwner, guestOwner, hostActor, guestActor, hostStore, guestStore, parties, party, previousMember, answer, saved }
}

it.each([
  { existing: false, failed: "none" },
  { existing: false, failed: "host-result" },
  { existing: false, failed: "guest-result" },
  { existing: false, failed: "guest-party" },
  { existing: false, failed: "host-party" },
  { existing: true, failed: "none" },
  { existing: true, failed: "guest-result" },
])("keeps durable membership and presence consistent after a notification failure: $existing / $failed", async (scenario) => {
  const f = await fixture(scenario.existing)
  const before = f.saved()
  const beforeRoster = scenario.existing ? await f.party("existing-group").actor.view() : null
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  if (scenario.failed !== "none") {
    const side = scenario.failed.startsWith("host-") ? f.host : f.guest
    const type = scenario.failed.endsWith("result") ? "result" : "party"
    let failed = false
    side.send.mockImplementation(async (message) => {
      if (!failed && message.type === type) {
        failed = true
        throw new Error("Connection closed")
      }
    })
  }
  const completed = await Promise.allSettled([f.answer()])
  const saved = f.saved()
  const id = saved.host.party
  expect(id).toBeTruthy()
  expect(saved.guest.party).toBe(id)
  expect(f.host.state.party).toBe(id)
  expect(f.guest.state.party).toBe(id)
  const store = f.parties.get(id!)!.store
  const roster = await new Party.class(store.state, {}).view()
  expect(roster.members.map((member) => member.owner)).toEqual(scenario.existing ? [f.hostOwner, f.previousMember.owner, f.guestOwner] : [f.hostOwner, f.guestOwner])
  expect(roster.leader).toBe(f.hostOwner)
  expect(roster.mode).toBe(scenario.existing ? "even" : "own")
  if (beforeRoster) expect(roster.members.slice(0, beforeRoster.members.length)).toEqual(beforeRoster.members)
  expect(completed).toEqual([{ status: "fulfilled", value: undefined }])
  expect(warn).toHaveBeenCalledTimes(scenario.failed === "none" ? 0 : 1)
  expect(f.host.state.inviting).toBeUndefined()
  expect(f.host.send).toHaveBeenCalledWith({ type: "party", view: expect.objectContaining({ leading: true }) })
  expect(f.guest.send).toHaveBeenCalledWith({ type: "party", view: expect.objectContaining({ leading: false }) })
  for (const side of ["host", "guest"] as const) {
    expect(saved[side].gold).toBe(before[side].gold)
    expect(saved[side].bag).toEqual(before[side].bag)
    expect(saved[side].equipment).toEqual(before[side].equipment)
  }
  expect((await new Player.class(f.hostStore.state, {}).read()).party).toBe(id)
  expect((await new Player.class(f.guestStore.state, {}).read()).party).toBe(id)
  const beforeReplay = f.saved()
  await f.answer()
  expect(f.saved()).toEqual(beforeReplay)
  expect(await new Party.class(store.state, {}).view()).toEqual(roster)
  expect(f.parties.size).toBe(1)
})

it.each(["host", "guest", "party"] as const)("propagates a %s storage error instead of catching it as a notification failure", async (side) => {
  const f = await fixture(side === "party")
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  const store = side === "party" ? f.party("existing-group").store : side === "host" ? f.hostStore : f.guestStore
  store.failNextSave()
  await expect(f.answer()).rejects.toThrow("Storage unavailable")
  expect(warn).not.toHaveBeenCalled()
  expect(f.guest.state.party).toBeUndefined()
})

it("does not enroll either player when the invitation is declined", async () => {
  const f = await fixture()
  const before = f.saved()
  await f.answer(false)
  expect(f.saved()).toEqual(before)
  expect(f.parties.size).toBe(0)
  expect(f.host.state.inviting).toBeUndefined()
  expect(f.host.send).toHaveBeenCalledExactlyOnceWith({ type: "party-closed", reason: "DECLINED" })
  expect(f.guest.send).not.toHaveBeenCalled()
})

it("preserves an existing roster and both players when the party fills after the invitation", async () => {
  const f = await fixture(true)
  const group = f.party("existing-group").actor
  for (let index = 2; index < PARTY_MAX; index++) await group.join({ ...f.previousMember, owner: `other-${index}` })
  const before = f.saved()
  const roster = await group.view()
  await f.answer()
  expect(f.saved()).toEqual(before)
  expect(await group.view()).toEqual(roster)
  expect(f.host.state.inviting).toBeUndefined()
  expect(f.guest.state.party).toBeUndefined()
  expect(f.guest.send).toHaveBeenCalledExactlyOnceWith({ type: "party-closed", reason: "FULL" })
})
