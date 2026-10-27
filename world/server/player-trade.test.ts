import { expect, it, vi } from "vitest"
import { Player } from "../../durable-objects/player.ts"
import { bagWith, player } from "../test/helpers.ts"
import type { TradeProposal } from "../core/trade-transaction.ts"

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
function fixture() {
  const saved = new Map<string, unknown>([
    [
      "__void_durable_state",
      {
        __voidDurableState: true,
        version: 0,
        value: { player: initialPlayer(), credential: "test-credential", location: null },
      },
    ],
  ])
  let fail = false
  const objectState = {
    id: { toString: () => "test-player" },
    blockConcurrencyWhile: <T>(fn: () => Promise<T>) => fn(),
    storage: {
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
  const restart = () => new Player.class(objectState as unknown as DurableObjectState, {}) as unknown as ReturnType<typeof Player.get>
  return {
    restart,
    saved,
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
  expect(f.saved.get("__void_durable_state")).toMatchObject({ version: 1, value: { trade: null } })
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
  const first = await p.finishTrade(proposal.id, 1, "committed")
  if (!first.ok) throw new Error(first.reason)
  const resumed = f.restart()
  const replay = await resumed.finishTrade(proposal.id, 1, "committed")
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
  await expect(p.finishTrade(proposal.id, 1, "committed")).rejects.toThrow("Storage unavailable")
  expect((await p.tradeStatus())?.status).toBe("prepared")
  expect((await p.read()).bag).toEqual(initialPlayer().bag)
  const resumed = f.restart()
  const committed = await resumed.finishTrade(proposal.id, 1, "committed")
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
  expect((await p.finishTrade(proposal.id, 1, "aborted")).ok).toBe(true)
  expect((await p.read()).bag).toEqual(initialPlayer().bag)
  await p.reset()
  expect((await p.tradeStatus())?.status).toBe("aborted")
  expect(await p.finishTrade(proposal.id, 1, "committed")).toEqual({ ok: false, reason: "NOT_READY" })
})

it("serializes a prepare and a concurrent inventory command", async () => {
  const f = fixture()
  const p = f.restart()
  const [prepared, spent] = await Promise.all([p.prepareTrade(proposal), p.run({ type: "trade-out", offer: { lots: [{ slot: 0, count: 1 }], gold: 0 } })])
  expect(prepared.ok).toBe(true)
  expect(spent).toEqual({ ok: false, reason: "NOT_READY" })
  expect((await p.read()).bag).toEqual(initialPlayer().bag)
})
