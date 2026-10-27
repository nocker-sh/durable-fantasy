import { expect, it } from "vitest"
import { BAG_SIZE, countItem, emptyBag } from "./bag.ts"
import { prepareTrade, finishTrade, type TradeProposal, type TradeRecord } from "./trade-transaction.ts"
import { bagWith, player } from "../test/helpers.ts"

const a = player({ gold: 100, bag: bagWith(["herb", 5]) })
const b = player({ gold: 50, bag: bagWith(["jelly", 4]) })
const proposal: TradeProposal = {
  id: "exchange-one",
  revision: 1,
  offer: { lots: [{ slot: 0, count: 5 }], gold: 10 },
  outgoing: [{ item: "herb", count: 5 }],
  incoming: [{ item: "jelly", count: 2 }],
  gold: 0,
}
function prepared(p = a, request = proposal, previous: TradeRecord | null = null) {
  const result = prepareTrade(p, previous, request, 1)
  if (!result.ok) throw new Error(result.reason)
  return result.record
}

it("reserves without removing goods, then exchanges both sides with conserved totals", () => {
  const before = structuredClone(a)
  const ra = prepared()
  const rb = prepared(b, { ...proposal, offer: { lots: [{ slot: 0, count: 2 }], gold: 0 }, outgoing: proposal.incoming, incoming: proposal.outgoing, gold: 10 })
  expect(a).toEqual(before)
  const fa = finishTrade(a, ra, proposal.id, 1, "committed")
  const fb = finishTrade(b, rb, proposal.id, 1, "committed")
  if (!fa.ok || !fb.ok) throw new Error("commit failed")
  expect(fa.player.gold + fb.player.gold).toBe(150)
  expect(fa.player.gold).toBe(90)
  expect(countItem(fa.player.bag, "jelly")).toBe(2)
  expect(countItem(fb.player.bag, "jelly")).toBe(2)
  expect(countItem(fa.player.bag, "herb")).toBe(0)
  expect(countItem(fb.player.bag, "herb")).toBe(5)
})

it("survives serialization and retries after a lost prepare or commit reply", () => {
  const record = JSON.parse(JSON.stringify(prepared())) as TradeRecord
  expect(prepareTrade(a, record, proposal, 2)).toEqual({ ok: true, record })
  const first = finishTrade(a, record, proposal.id, 1, "committed")
  if (!first.ok) throw new Error(first.reason)
  const restored = JSON.parse(JSON.stringify(first)) as typeof first
  const retry = finishTrade(restored.player, restored.record, proposal.id, 1, "committed")
  expect(retry).toEqual(first)
  expect(prepareTrade(first.player, first.record, proposal, 3)).toEqual({ ok: true, record: first.record })
})

it("aborts without moving anything and never changes a durable decision", () => {
  const record = prepared()
  const aborted = finishTrade(a, record, proposal.id, 1, "aborted")
  if (!aborted.ok) throw new Error(aborted.reason)
  expect(aborted.player).toBe(a)
  expect(finishTrade(a, aborted.record, proposal.id, 1, "aborted")).toEqual(aborted)
  expect(finishTrade(a, aborted.record, proposal.id, 1, "committed")).toEqual({ ok: false, reason: "NOT_READY" })
  const committed = finishTrade(a, record, proposal.id, 1, "committed")
  if (!committed.ok) throw new Error(committed.reason)
  expect(finishTrade(committed.player, committed.record, proposal.id, 1, "aborted")).toEqual({ ok: false, reason: "NOT_READY" })
})

it("rejects overlapping reservations and stale requests after a later trade", () => {
  const first = prepared()
  const secondRequest = { ...proposal, id: "exchange-two", revision: 2 }
  expect(prepareTrade(a, first, secondRequest, 2)).toEqual({ ok: false, reason: "NOT_READY" })
  const cancelled = finishTrade(a, first, proposal.id, 1, "aborted")
  if (!cancelled.ok) throw new Error(cancelled.reason)
  const second = prepared(a, secondRequest, cancelled.record)
  expect(prepareTrade(a, second, proposal, 3)).toEqual({ ok: false, reason: "NOT_READY" })
  expect(finishTrade(a, second, proposal.id, 1, "committed")).toEqual({ ok: false, reason: "NOT_READY" })
  expect(prepareTrade(a, null, secondRequest, 3)).toEqual({ ok: false, reason: "NOT_READY" })
})

it("rejects changed contents under the same transaction identity", () => {
  const record = prepared()
  for (const changed of [
    { ...proposal, gold: 100 },
    { ...proposal, incoming: [{ item: "jelly" as const, count: 3 }] },
    { ...proposal, offer: { ...proposal.offer, gold: 0 } },
    { ...proposal, id: "another-exchange" },
  ])
    expect(prepareTrade(a, record, changed, 2)).toEqual({ ok: false, reason: "NOT_READY" })
})

it("rejects goods changed since confirmation and preserves tool quality, maker and wear", () => {
  const tool = { item: "wood-axe" as const, count: 1, q: 2 as const, by: "ペーター", dur: 5 }
  const owner = player({ bag: [tool, ...Array(BAG_SIZE - 1).fill(null)] })
  const request = { ...proposal, offer: { lots: [{ slot: 0, count: 1 }], gold: 0 }, outgoing: [tool], incoming: [] }
  expect(prepareTrade(owner, null, { ...request, outgoing: [{ ...tool, dur: 6 }] }, 1)).toEqual({ ok: false, reason: "NOT_READY" })
  const receiver = player({ bag: bagWith() })
  const received = prepared(receiver, { ...request, offer: { lots: [], gold: 0 }, outgoing: [], incoming: [tool] })
  expect(received.inventory.bag[0]).toEqual(tool)
})

it("rejects insufficient gold and full bags before holding either inventory", () => {
  expect(prepareTrade(a, null, { ...proposal, offer: { ...proposal.offer, gold: 101 } }, 1)).toEqual({ ok: false, reason: "NO_GOLD" })
  const full = player({ bag: Array.from({ length: BAG_SIZE }, () => ({ item: "log" as const, count: 99 })) })
  expect(prepareTrade(full, null, { ...proposal, offer: { lots: [], gold: 0 }, outgoing: [] }, 1)).toEqual({ ok: false, reason: "BAG_FULL" })
})

it("committing preserves recovery and other unrelated player fields", () => {
  const record = prepared()
  const recovered = { ...a, hp: a.hp + 1, name: "エルナ" }
  const result = finishTrade(recovered, record, proposal.id, 1, "committed")
  expect(result.ok && result.player.hp).toBe(recovered.hp)
  expect(result.ok && result.player.name).toBe("エルナ")
})

it("keeps unmarked and crafted goods distinct across a saved trade and repeated commit", () => {
  const goods = [
    { item: "fur-stole", count: 1 },
    { item: "potion", count: 2 },
  ] as const
  const existing = { item: "potion", count: 4, q: 1, by: "イルムガルト" } as const
  const recipient = player({ bag: [existing, ...emptyBag(23)] })
  const request: TradeProposal = { id: "unmarked-goods", revision: 1, offer: { lots: [], gold: 0 }, outgoing: [], incoming: goods, gold: 0 }
  const reserved = prepared(recipient, request)
  const restored = JSON.parse(JSON.stringify(reserved)) as TradeRecord
  const committed = finishTrade(recipient, restored, request.id, 1, "committed")
  if (!committed.ok) throw Error(committed.reason)
  expect(committed.player.bag.slice(0, 3)).toEqual([existing, ...goods])
  expect(recipient.bag[1]).toBeNull()
  const retry = finishTrade(committed.player, committed.record, request.id, 1, "committed")
  expect(retry).toEqual(committed)
})
