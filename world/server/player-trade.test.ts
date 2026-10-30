import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"
import type { TradeProposal } from "#/world/core/trade-transaction-types"

// Exercise Void's actual method queue, migration and persistence rollback with in-memory storage.
vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))

const proposal: TradeProposal = {
  id: "trade-one",
  revision: 1,
  offer: { lots: [{ slot: 0, count: 2 }], gold: 10 },
  outgoing: [{ item: "herb", count: 2 }],
  incoming: [{ item: "jelly", count: 1 }],
  gold: 3,
}
const initialPlayer = () => player({ gold: 100, bag: bagWith(["herb", 3]) })
function fixture(initial = initialPlayer()) {
  const saved = new Map<string, unknown>([
    [
      "__void_durable_state",
      {
        __voidDurableState: true,
        version: 0,
        value: { player: initial, credential: "test-credential", location: null },
      },
    ],
  ])
  let fail = false
  const objectState = {
    id: { toString: () => "test-player" },
    blockConcurrencyWhile: <T>(fn: () => Promise<T>) => fn(),
    storage: {
      setAlarm: vi.fn(async (_at: number) => {}),
      get: async (key: string) => structuredClone(saved.get(key)),
      put: async (key: string, value: unknown) => {
        if (fail) {
          fail = false
          throw new Error("Storage unavailable")
        }
        saved.set(key, structuredClone(value))
      },
    },
  }
  const restart = () => new Player.class(objectState as unknown as DurableObjectState, {})
  return {
    restart,
    saved,
    alarms: objectState.storage.setAlarm,
    failNextSave: () => {
      fail = true
    },
  }
}

it("migrates old player data without losing identity or inventory", async () => {
  const f = fixture()
  const p = f.restart()
  expect(await p.tradeStatus()).toBeNull()
  expect(await p.authenticate("test-credential")).toBe(true)
  expect((await p.read()).bag).toEqual(initialPlayer().bag)
  expect(f.saved.get("__void_durable_state")).toMatchObject({ version: 8, value: { trade: null, tradeJob: null, exchangeReceipt: null } })
})

it("persists a reservation across restart and blocks commands and debug inventory mutations", async () => {
  const f = fixture()
  const p = f.restart()
  expect((await p.prepareTrade(proposal)).ok).toBe(true)
  const resumed = f.restart()
  expect((await resumed.tradeStatus())?.status).toBe("prepared")
  expect(await resumed.run({ type: "use", slot: 0 })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(await resumed.run({ type: "trade-out", offer: proposal.offer })).toEqual({ ok: false, reason: "NOT_READY" })
  await expect(resumed.give("herb", 1)).rejects.toThrow("Trade is pending")
  await expect(resumed.reset()).rejects.toThrow("Trade is pending")
  expect((await resumed.read()).bag).toEqual(initialPlayer().bag)
})

it("persists inventory and decision together, and a lost response can be retried after restart", async () => {
  const f = fixture()
  const p = f.restart()
  await p.prepareTrade(proposal)
  const first = await p.finishTrade({ id: proposal.id, revision: 1, decision: "committed" })
  if (!first.ok) throw new Error(first.reason)
  const resumed = f.restart()
  const replay = await resumed.finishTrade({ id: proposal.id, revision: 1, decision: "committed" })
  if (!replay.ok) throw new Error(replay.reason)
  expect(replay.state.bag).toEqual(first.state.bag)
  expect(replay.state.gold).toBe(93)
  expect((await resumed.tradeStatus())?.status).toBe("committed")
  expect((await resumed.prepareTrade(proposal)).ok).toBe(true)
  expect((await resumed.tradeStatus())?.status).toBe("committed")
})

it("rolls back both inventory and decision if the commit save fails, then retries once", async () => {
  const f = fixture()
  const p = f.restart()
  await p.prepareTrade(proposal)
  f.failNextSave()
  await expect(p.finishTrade({ id: proposal.id, revision: 1, decision: "committed" })).rejects.toThrow("Storage unavailable")
  expect((await p.tradeStatus())?.status).toBe("prepared")
  expect((await p.read()).bag).toEqual(initialPlayer().bag)
  const resumed = f.restart()
  const committed = await resumed.finishTrade({ id: proposal.id, revision: 1, decision: "committed" })
  expect(committed.ok && committed.state.gold).toBe(93)
})

it("rolls back a failed prepare save and allows normal commands again", async () => {
  const f = fixture()
  const p = f.restart()
  await p.read()
  f.failNextSave()
  await expect(p.prepareTrade(proposal)).rejects.toThrow("Storage unavailable")
  expect(await p.tradeStatus()).toBeNull()
  expect((await p.run({ type: "trade-out", offer: { lots: [], gold: 1 } })).ok).toBe(true)
})

it("cancels without changing goods and retains the revision across a debug reset", async () => {
  const f = fixture()
  const p = f.restart()
  await p.prepareTrade(proposal)
  expect((await p.finishTrade({ id: proposal.id, revision: 1, decision: "aborted" })).ok).toBe(true)
  expect((await p.read()).bag).toEqual(initialPlayer().bag)
  await p.reset()
  expect((await p.tradeStatus())?.status).toBe("aborted")
  expect(await p.finishTrade({ id: proposal.id, revision: 1, decision: "committed" })).toEqual({ ok: false, reason: "NOT_READY" })
})

it("serializes a prepare and a concurrent inventory command", async () => {
  const f = fixture()
  const p = f.restart()
  const [prepared, spent] = await Promise.all([p.prepareTrade(proposal), p.run({ type: "trade-out", offer: { lots: [{ slot: 0, count: 1 }], gold: 0 } })])
  expect(prepared.ok).toBe(true)
  expect(spent).toEqual({ ok: false, reason: "NOT_READY" })
  expect((await p.read()).bag).toEqual(initialPlayer().bag)
})

afterEach(() => vi.restoreAllMocks())
const remoteProposal: TradeProposal = {
  ...proposal,
  offer: { lots: [{ slot: 0, count: 1 }], gold: 3 },
  outgoing: proposal.incoming,
  incoming: proposal.outgoing,
  gold: 10,
}
function pair() {
  const local = fixture()
  const remote = fixture(player({ gold: 50, bag: bagWith(["jelly", 2]) }))
  let peer = remote.restart()
  vi.spyOn(Player, "get").mockImplementation(() => peer as unknown as ReturnType<typeof Player.get>)
  return {
    local,
    remote,
    peer,
    restartPeer: () => {
      peer = remote.restart()
      return peer
    },
  }
}

it("persists the decision before delivering it and recovers via the real alarm hook", async () => {
  const f = pair()
  let owner = f.local.restart()
  expect((await owner.beginTrade({ peer: "peer", local: proposal, remote: remoteProposal })).ok).toBe(true)
  expect(f.local.alarms).toHaveBeenCalled()
  owner = f.local.restart()
  await owner.alarm()
  expect((await owner.tradeJob())?.decision).toBe("committed")
  expect((await f.peer.tradeStatus())?.status).toBe("prepared")
  expect((await owner.read()).gold).toBe(100)
  expect((await f.peer.read()).gold).toBe(50)
  owner = f.local.restart()
  await owner.alarm()
  expect((await owner.tradeJob())?.finished).toBe(true)
  expect((await owner.read()).gold).toBe(93)
  expect((await f.peer.read()).gold).toBe(57)
  await owner.alarm()
  expect((await f.peer.read()).gold).toBe(57)
})

it("recovers a lost peer prepare response without cancelling reserved goods", async () => {
  const f = pair()
  const owner = f.local.restart()
  await owner.beginTrade({ peer: "peer", local: proposal, remote: remoteProposal })
  const prepare = f.peer.prepareTrade.bind(f.peer)
  vi.spyOn(f.peer, "prepareTrade").mockImplementationOnce(async (request) => {
    await prepare(request)
    throw new Error("Reply lost")
  })
  await expect(owner.advanceTrade()).rejects.toThrow("Reply lost")
  expect((await owner.tradeJob())?.decision).toBeNull()
  expect((await f.peer.tradeStatus())?.status).toBe("prepared")
  f.restartPeer()
  const resumed = f.local.restart()
  await resumed.advanceTrade()
  await resumed.advanceTrade()
  expect((await resumed.read()).gold).toBe(93)
})

it("recovers when the local commit save fails after the peer already committed", async () => {
  const f = pair()
  const owner = f.local.restart()
  await owner.beginTrade({ peer: "peer", local: proposal, remote: remoteProposal })
  await owner.advanceTrade()
  f.local.failNextSave()
  await expect(owner.advanceTrade()).rejects.toThrow("Storage unavailable")
  expect((await f.peer.read()).gold).toBe(57)
  expect((await owner.read()).gold).toBe(100)
  expect((await owner.tradeJob())?.finished).toBe(false)
  const resumed = f.local.restart()
  await resumed.advanceTrade()
  expect((await resumed.read()).gold).toBe(93)
  expect((await f.peer.read()).gold).toBe(57)
})

it("aborts after an explicit peer refusal and unlocks the local inventory", async () => {
  const f = pair()
  const owner = f.local.restart()
  await f.peer.run({ type: "trade-out", offer: { lots: [{ slot: 0, count: 2 }], gold: 0 } })
  await owner.beginTrade({ peer: "peer", local: proposal, remote: remoteProposal })
  await owner.advanceTrade()
  expect((await owner.tradeJob())?.decision).toBe("aborted")
  await owner.advanceTrade()
  expect((await owner.read()).gold).toBe(100)
  expect((await owner.tradeStatus())?.status).toBe("aborted")
  expect((await owner.run({ type: "trade-out", offer: { lots: [], gold: 1 } })).ok).toBe(true)
})

it("rejects mismatched reciprocal goods and does not reserve anything", async () => {
  const f = pair()
  const owner = f.local.restart()
  expect(await owner.beginTrade({ peer: "peer", local: proposal, remote: { ...remoteProposal, gold: 100 } })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(await owner.tradeStatus()).toBeNull()
  expect(await owner.tradeJob()).toBeNull()
})

it("replays preparation after the coordinator decision save fails", async () => {
  const f = pair()
  const owner = f.local.restart()
  await owner.beginTrade({ peer: "peer", local: proposal, remote: remoteProposal })
  f.local.failNextSave()
  await expect(owner.advanceTrade()).rejects.toThrow("Storage unavailable")
  expect((await owner.tradeJob())?.decision).toBeNull()
  expect((await f.peer.tradeStatus())?.status).toBe("prepared")
  const resumed = f.local.restart()
  await resumed.advanceTrade()
  await resumed.advanceTrade()
  expect((await resumed.read()).gold).toBe(93)
  expect((await f.peer.read()).gold).toBe(57)
})

it("finishes a lost commit reply even after the peer has completed a later exchange", async () => {
  const f = pair()
  const owner = f.local.restart()
  await owner.beginTrade({ peer: "peer", local: proposal, remote: remoteProposal })
  await owner.advanceTrade()
  f.local.failNextSave()
  await expect(owner.advanceTrade()).rejects.toThrow("Storage unavailable")
  const later = { ...remoteProposal, id: "later-exchange", revision: 2, offer: { lots: [], gold: 0 }, outgoing: [], incoming: [], gold: 0 }
  expect((await f.peer.prepareTrade(later)).ok).toBe(true)
  await f.peer.finishTrade({ id: later.id, revision: 2, decision: "committed" })
  await f.local.restart().advanceTrade()
  expect((await f.local.restart().read()).gold).toBe(93)
  expect((await f.peer.read()).gold).toBe(57)
})
