import { afterEach, expect, it, vi } from "vitest"
import { Party } from "#/durable-objects/party"
import { Player } from "#/durable-objects/player"
import { KeyedQueue } from "#/lib/engine/keyed-queue"
import { emptyPartyChat } from "#/world/core/empty-party-chat"
import { newPlayer } from "#/world/core/new-player"
import { ASK_GAP_MS } from "#/world/core/pace-rules"
import { emptyParty } from "#/world/core/party/empty-party"
import { TOWN_SPAWN } from "#/world/core/player-rules"
import type { Cell, ServerMessage } from "#/world/protocol"
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

function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

async function fixture() {
  vi.useFakeTimers()
  vi.setSystemTime(100_000)
  const queue = new KeyedQueue()
  function side(id: string, owner: string, name: string) {
    const player = { ...newPlayer(name), profileComplete: true }
    const store = durableStorage({ ...initialPlayerRecord(), player }, 8)
    const at: Cell = [...TOWN_SPAWN.cell]
    const socket = {
      id,
      state: { owner, player: mapPlayer(id, player, at), route: [at], since: Date.now(), said: [], engaged: null } as Presence,
      send: vi.fn(async (_message: ServerMessage) => {}),
      setState(next: Presence) {
        socket.state = next
      },
    }
    return { owner, store, socket, actor: new Player.class(store.state, {}), initial: player }
  }
  const host = side("host", "00000000-0000-4000-8000-000000000001", "Host")
  const first = side("first", "00000000-0000-4000-8000-000000000002", "First")
  const second = side("second", "00000000-0000-4000-8000-000000000003", "Second")
  const players = [host, first, second]
  vi.spyOn(Player, "get").mockImplementation((owner: unknown) => {
    const found = players.find((candidate) => candidate.owner === owner)
    if (!found) throw new Error("Unexpected player")
    return found.actor as unknown as ReturnType<typeof Player.get>
  })
  for (const player of players) {
    expect(await player.actor.arrive({ world: 1, map: TOWN_SPAWN.map, connection: player.socket.id })).toEqual({ map: TOWN_SPAWN.map, at: TOWN_SPAWN.cell, accepted: true })
  }
  const parties = new Map<string, { actor: InstanceType<typeof Party.class>; store: ReturnType<typeof durableStorage> }>()
  let nextJoin: { reached: ReturnType<typeof deferred>; release: ReturnType<typeof deferred> } | null = null
  vi.spyOn(Party, "get").mockImplementation((input: unknown) => {
    const id = String(input)
    if (!parties.has(id)) {
      const store = durableStorage({ party: emptyParty(), chat: emptyPartyChat() }, 0)
      const actor = new Party.class(store.state, {})
      const join = actor.join.bind(actor)
      vi.spyOn(actor, "join").mockImplementation(async (member) => {
        const accepted = await join(member)
        // Delay only the RPC response: the real join and its durable save already finished.
        if (member.owner === host.owner && nextJoin) {
          const held = nextJoin
          nextJoin = null
          held.reached.resolve()
          await held.release.promise
        }
        return accepted
      })
      parties.set(id, { actor, store })
    }
    return parties.get(id)!.actor as unknown as ReturnType<typeof Party.get>
  })
  const room = (player: typeof host) => ({
    me: player.socket.state,
    save: (patch: Partial<Presence>) => setPresence(player.socket, patch),
    map: { name: "広場" },
    ctx: { connection: player.socket, room: { getConnection: (id: string) => players.find((candidate) => candidate.socket.id === id)?.socket } },
  })
  const dispatch = (player: typeof host, work: () => Promise<void>) =>
    queue.run(player.socket.id, async () => {
      // Production serializes per connection and checks the actual saved connection lease.
      expect(await player.actor.ownsConnection(player.socket.id)).toBe(true)
      await work()
    })
  const inviteFrom = (asker: typeof host, guest: typeof host) => dispatch(asker, () => handlePartyInvite(room(asker), { type: "party-invite", target: guest.socket.id }))
  const answerFrom = (guest: typeof host, asker: typeof host) => dispatch(guest, () => handlePartyAnswer(room(guest), { type: "party-answer", from: asker.socket.id, yes: true }))
  const invite = (guest: typeof host) => inviteFrom(host, guest)
  const answer = (guest: typeof host) => answerFrom(guest, host)
  const delayJoin = () => {
    const held = { reached: deferred(), release: deferred() }
    nextJoin = held
    return held
  }
  const delayPace = () => {
    const held = { reached: deferred(), release: deferred() }
    const pace = host.actor.pace.bind(host.actor)
    vi.spyOn(host.actor, "pace").mockImplementationOnce(async (input) => {
      const accepted = await pace(input)
      expect(accepted).toBe(true)
      held.reached.resolve()
      await held.release.promise
      return accepted
    })
    return held
  }
  const delayRecipientReadFailure = (failure: "reply" | "storage") => {
    const held = { reached: deferred(), release: deferred() }
    const read = first.actor.read.bind(first.actor)
    vi.spyOn(first.actor, "read").mockImplementationOnce(async () => {
      held.reached.resolve()
      await held.release.promise
      if (failure === "storage") first.store.failNextSave()
      const result = await read()
      if (failure === "reply") throw new Error("Player RPC reply unavailable")
      return result
    })
    return held
  }
  const consistent = async () => {
    // Replace every RPC locator before reading again; a restarted id has just one live actor.
    for (const player of players) player.actor = new Player.class(player.store.state, {})
    for (const group of parties.values()) group.actor = new Party.class(group.store.state, {})
    const saved = await Promise.all(players.map((player) => player.actor.read()))
    for (let index = 0; index < players.length; index++) {
      expect(players[index].socket.state.party ?? null).toBe(saved[index].party)
      expect(saved[index].gold).toBe(players[index].initial.gold)
      expect(saved[index].bag).toEqual(players[index].initial.bag)
      expect(saved[index].equipment).toEqual(players[index].initial.equipment)
    }
    const ghosts: { owner: string; roster: string; saved: string | null }[] = []
    for (const entry of parties) {
      const roster = await entry[1].actor.view()
      expect(roster.members.length).toBeGreaterThanOrEqual(2)
      for (const member of roster.members) {
        const index = players.findIndex((player) => player.owner === member.owner)
        expect(index).toBeGreaterThanOrEqual(0)
        if (saved[index].party !== entry[0]) ghosts.push({ owner: member.owner, roster: entry[0], saved: saved[index].party })
      }
    }
    expect(ghosts).toEqual([])
    expect(parties.size).toBe(1)
    expect(saved[0].party).toBe(saved[1].party)
    expect(saved[1].party).toBeTruthy()
    expect(saved[2].party === null || saved[2].party === saved[0].party).toBe(true)
    return saved
  }
  await invite(first)
  expect(host.socket.state.inviting).toBe(first.socket.id)
  expect(first.socket.send).toHaveBeenCalledWith({ type: "party-invited", from: host.socket.id, name: "Host" })
  return { host, first, second, parties, invite, answer, inviteFrom, answerFrom, delayJoin, delayPace, delayRecipientReadFailure, consistent }
}

it("can accept consecutive invitations into one durable party", async () => {
  const f = await fixture()
  await f.answer(f.first)
  vi.setSystemTime(Date.now() + ASK_GAP_MS)
  await f.invite(f.second)
  await f.answer(f.second)
  const saved = await f.consistent()
  expect(saved[2].party).toBe(saved[0].party)
  expect((await f.parties.get(saved[0].party!)!.actor.view()).members.map((member) => member.owner)).toEqual([f.host.owner, f.first.owner, f.second.owner])
})

it("does not create competing parties while the first acceptance awaits an RPC response", async () => {
  const f = await fixture()
  const join = f.delayJoin()
  const first = f.answer(f.first)
  await join.reached.promise
  expect(f.host.socket.state.party ?? null).toBeNull()
  vi.setSystemTime(Date.now() + ASK_GAP_MS)
  try {
    await f.invite(f.second)
    await f.answer(f.second)
  } finally {
    join.release.resolve()
    await first
  }
  await f.consistent()
})

it("rechecks an invitation whose successful pace response overlaps an acceptance", async () => {
  const f = await fixture()
  vi.setSystemTime(Date.now() + ASK_GAP_MS)
  const pace = f.delayPace()
  const invite = f.invite(f.second)
  await pace.reached.promise
  const join = f.delayJoin()
  const first = f.answer(f.first)
  await join.reached.promise
  try {
    pace.release.resolve()
    await invite
    await f.answer(f.second)
  } finally {
    join.release.resolve()
    await first
  }
  await f.consistent()
})

it.each(["reply", "storage"] as const)("releases both acceptance guards after a %s failure and permits the next ordinary invitation", async (failure) => {
  const f = await fixture()
  const read = f.delayRecipientReadFailure(failure)
  const completion = Promise.allSettled([f.answer(f.first)])
  await read.reached.promise
  expect(f.host.socket.state.partyPending).toBe(true)
  expect(f.first.socket.state.partyPending).toBe(true)
  expect(f.host.socket.state.party).toBeTruthy()
  f.host.socket.send.mockClear()
  try {
    vi.setSystemTime(Date.now() + ASK_GAP_MS)
    await f.invite(f.second)
    expect(f.host.socket.send).toHaveBeenCalledExactlyOnceWith({ type: "party-closed", reason: "BUSY" })
    expect(f.second.socket.send).not.toHaveBeenCalled()
  } finally {
    read.release.resolve()
  }
  expect(await completion).toEqual([{ status: "rejected", reason: expect.objectContaining({ message: failure === "reply" ? "Player RPC reply unavailable" : "Storage unavailable" }) }])
  expect(f.host.socket.state.partyPending).toBe(false)
  expect(f.first.socket.state.partyPending).toBe(false)
  expect(f.host.socket.state.inviting).toBeUndefined()
  await f.invite(f.first)
  expect(f.host.socket.state.inviting).toBe(f.first.socket.id)
  await f.answer(f.first)
  expect(f.host.socket.state.partyPending).toBe(false)
  expect(f.first.socket.state.partyPending).toBe(false)
  await f.consistent()
})

it.each(["inviter", "recipient"] as const)("refuses an already-issued invitation when its %s is registering another acceptance", async (participant) => {
  const f = await fixture()
  const asker = participant === "inviter" ? f.first : f.second
  const recipient = participant === "inviter" ? f.second : f.host
  await f.inviteFrom(asker, recipient)
  expect(asker.socket.state.inviting).toBe(recipient.socket.id)
  const join = f.delayJoin()
  const first = f.answer(f.first)
  await join.reached.promise
  recipient.socket.send.mockClear()
  try {
    await f.answerFrom(recipient, asker)
    expect(recipient.socket.send).toHaveBeenCalledExactlyOnceWith({ type: "party-closed", reason: "BUSY" })
    expect(asker.socket.state.inviting).toBeUndefined()
    expect(f.host.socket.state.partyPending).toBe(true)
    expect(f.first.socket.state.partyPending).toBe(true)
  } finally {
    join.release.resolve()
    await first
  }
  await f.consistent()
})
