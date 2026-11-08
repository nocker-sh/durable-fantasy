import { afterEach, expect, it, vi } from "vitest"
import { Party } from "#/durable-objects/party"
import { Player } from "#/durable-objects/player"
import { emptyPartyChat } from "#/world/core/empty-party-chat"
import { newPlayer } from "#/world/core/new-player"
import { emptyParty } from "#/world/core/party/empty-party"
import type { TradeProposal } from "#/world/core/trade-transaction-types"
import type { ServerMessage } from "#/world/protocol"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { handlePartyAnswer } from "#/world/server/map-room/handle-party-answer"
import { handlePartyInvite } from "#/world/server/map-room/handle-party-invite"
import { handlePartyLeave } from "#/world/server/map-room/handle-party-leave"
import { handlePartyLook } from "#/world/server/map-room/handle-party-look"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { setPresence } from "#/world/server/map-room/set-presence"
import type { Presence } from "#/world/server/map-room/presence"
import { bagWith } from "#/world/test/bag-with"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

const proposal: TradeProposal = {
  id: "pending-trade",
  revision: 1,
  offer: { lots: [{ slot: 0, count: 2 }], gold: 10 },
  outgoing: [{ item: "herb", count: 2 }],
  incoming: [{ item: "jelly", count: 1 }],
  gold: 3,
}

async function fixture() {
  vi.useFakeTimers()
  vi.setSystemTime(100_000)
  const players = ["host", "guest"].map((id) => {
    const initial = { ...newPlayer(id === "host" ? "Host" : "Guest"), gold: 100, bag: bagWith(["herb", 3]) }
    const store = durableStorage({ ...initialPlayerRecord(), player: initial }, 8)
    const actor = new Player.class(store.state, {})
    const connection = {
      id,
      state: { owner: id, player: mapPlayer(id, initial, [10, 10]), route: [[10, 10]], since: Date.now(), said: [], engaged: null } as Presence,
      send: vi.fn(async (_message: ServerMessage) => {}),
      setState(state: Presence) {
        connection.state = state
      },
    }
    return {
      actor,
      store,
      connection,
      restart() {
        this.actor = new Player.class(store.state, {})
        return this.actor
      },
    }
  })
  const room = (side: (typeof players)[number]) => ({
    get me() {
      return side.connection.state
    },
    save: (patch: Partial<Presence>) => setPresence(side.connection, patch),
    map: { name: "広場" },
    ctx: { connection: side.connection, room: { getConnection: (target: string) => players.find((player) => player.connection.id === target)?.connection } },
  })
  const host = Object.assign(players[0], { room: room(players[0]) })
  const guest = Object.assign(players[1], { room: room(players[1]) })
  vi.spyOn(Player, "get").mockImplementation((owner: unknown) => {
    const found = players.find((player) => player.connection.id === owner)
    if (!found) throw new Error("Unexpected player")
    return found.actor as unknown as ReturnType<typeof Player.get>
  })
  const store = durableStorage({ party: emptyParty(), chat: emptyPartyChat() }, 0)
  const party = {
    actor: new Party.class(store.state, {}),
    restart() {
      this.actor = new Party.class(store.state, {})
      return this.actor
    },
  }
  let partyId: string | null = null
  vi.spyOn(Party, "get").mockImplementation((id: unknown) => {
    if (partyId !== null) expect(id).toBe(partyId)
    partyId = String(id)
    return party.actor as unknown as ReturnType<typeof Party.get>
  })
  await handlePartyInvite(host.room, { type: "party-invite", target: guest.connection.id })
  expect(host.connection.state.inviting).toBe(guest.connection.id)
  const answer = () => handlePartyAnswer(guest.room, { type: "party-answer", from: host.connection.id, yes: true })
  return { host, guest, party, store, answer, id: () => partyId }
}

it.each([
  { side: "host", decision: "committed" },
  { side: "guest", decision: "committed" },
  { side: "host", decision: "aborted" },
  { side: "guest", decision: "aborted" },
] as const)("joins both players while $side has a prepared trade, and preserves membership after $decision", async (scenario) => {
  const f = await fixture()
  const selected = f[scenario.side]
  const before = await selected.actor.read()
  expect((await selected.actor.prepareTrade(proposal)).ok).toBe(true)
  expect(await selected.actor.run({ type: "discard", slot: 0, count: 1 })).toEqual({ ok: false, reason: "NOT_READY" })
  await f.answer()
  const id = f.id()
  expect(id).toBeTruthy()
  const membership = await selected.restart().read()
  expect(membership.party).toBe(id)
  expect(membership.bag).toEqual(before.bag)
  expect(membership.gold).toBe(before.gold)
  expect((await selected.actor.tradeStatus())?.status).toBe("prepared")
  expect((await f.host.actor.read()).party).toBe(id)
  expect((await f.guest.actor.read()).party).toBe(id)
  expect(f.host.connection.state.party).toBe(id)
  expect(f.guest.connection.state.party).toBe(id)
  expect((await f.party.restart().view()).members.map((member) => member.owner)).toEqual(["host", "guest"])

  const command = { id: proposal.id, revision: proposal.revision, decision: scenario.decision }
  expect((await selected.actor.finishTrade(command)).ok).toBe(true)
  const finished = await selected.restart().read()
  expect(finished.party).toBe(id)
  expect(finished.bag).toEqual(scenario.decision === "committed" ? bagWith(["herb", 1], ["jelly", 1]) : before.bag)
  expect(finished.gold).toBe(scenario.decision === "committed" ? 93 : before.gold)
  expect((await selected.actor.finishTrade(command)).ok).toBe(true)
  expect((await selected.actor.read()).bag).toEqual(finished.bag)
  expect((await selected.actor.read()).gold).toBe(finished.gold)
  const afterReplay = await selected.restart().read()
  expect(afterReplay.revision).toBeGreaterThan(finished.revision)
  expect(afterReplay).toEqual({ ...finished, revision: afterReplay.revision })
})

it.each(["committed", "aborted"] as const)("leaves a party during a prepared trade and remains out after it is %s", async (decision) => {
  const f = await fixture()
  await f.answer()
  const before = await f.guest.actor.read()
  expect((await f.guest.actor.prepareTrade(proposal)).ok).toBe(true)
  expect(await f.guest.actor.run({ type: "discard", slot: 0, count: 1 })).toEqual({ ok: false, reason: "NOT_READY" })
  await handlePartyLeave(f.guest.room, { type: "party-leave" })
  const left = await f.guest.restart().read()
  expect(left.party).toBeNull()
  expect(f.guest.connection.state.party).toBeNull()
  expect(left.bag).toEqual(before.bag)
  expect(left.gold).toBe(before.gold)
  expect((await f.guest.actor.tradeStatus())?.status).toBe("prepared")
  expect((await f.party.restart().view()).members).toEqual([])
  // A party of one dissolves; the remaining player observes that through the real polling handler.
  await handlePartyLook(f.host.room, { type: "party-look" })
  expect((await f.host.actor.read()).party).toBeNull()
  expect(f.host.connection.state.party).toBeNull()

  const command = { id: proposal.id, revision: proposal.revision, decision }
  expect((await f.guest.actor.finishTrade(command)).ok).toBe(true)
  const finished = await f.guest.restart().read()
  expect(finished.party).toBeNull()
  expect(finished.bag).toEqual(decision === "committed" ? bagWith(["herb", 1], ["jelly", 1]) : before.bag)
  expect(finished.gold).toBe(decision === "committed" ? 93 : before.gold)
  expect((await f.guest.actor.finishTrade(command)).ok).toBe(true)
  const afterReplay = await f.guest.restart().read()
  expect(afterReplay.revision).toBeGreaterThan(finished.revision)
  expect(afterReplay).toEqual({ ...finished, revision: afterReplay.revision })
})
