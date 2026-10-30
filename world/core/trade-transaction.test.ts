import { expect, it } from "vitest"
import { BAG_SIZE } from "#/world/core/bag-rules"
import { countItem } from "#/world/core/count-item"
import { emptyBag } from "#/world/core/empty-bag"
import { prepareTrade } from "#/world/core/prepare-trade"
import { finishTrade } from "#/world/core/finish-trade"
import type { TradeProposal } from "#/world/core/trade-transaction-types"
import type { TradeRecord } from "#/world/core/trade-transaction-types"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"

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
  const result = prepareTrade({ player: p, previous: previous, proposal: request, now: 1 })
  if (!result.ok) throw new Error(result.reason)
  return result.record
}

it("reserves without removing goods, then exchanges both sides with conserved totals", () => {
  const before = structuredClone(a)
  const ra = prepared()
  const rb = prepared(b, { ...proposal, offer: { lots: [{ slot: 0, count: 2 }], gold: 0 }, outgoing: proposal.incoming, incoming: proposal.outgoing, gold: 10 })
  expect(a).toEqual(before)
  const fa = finishTrade({ player: a, record: ra, id: proposal.id, revision: 1, decision: "committed" })
  const fb = finishTrade({ player: b, record: rb, id: proposal.id, revision: 1, decision: "committed" })
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
  expect(prepareTrade({ player: a, previous: record, proposal: proposal, now: 2 })).toEqual({ ok: true, record })
  const first = finishTrade({ player: a, record: record, id: proposal.id, revision: 1, decision: "committed" })
  if (!first.ok) throw new Error(first.reason)
  const restored = JSON.parse(JSON.stringify(first)) as typeof first
  const retry = finishTrade({ player: restored.player, record: restored.record, id: proposal.id, revision: 1, decision: "committed" })
  expect(retry).toEqual(first)
  expect(prepareTrade({ player: first.player, previous: first.record, proposal: proposal, now: 3 })).toEqual({ ok: true, record: first.record })
})

it("aborts without moving anything and never changes a durable decision", () => {
  const record = prepared()
  const aborted = finishTrade({ player: a, record: record, id: proposal.id, revision: 1, decision: "aborted" })
  if (!aborted.ok) throw new Error(aborted.reason)
  expect(aborted.player).toBe(a)
  expect(finishTrade({ player: a, record: aborted.record, id: proposal.id, revision: 1, decision: "aborted" })).toEqual(aborted)
  expect(finishTrade({ player: a, record: aborted.record, id: proposal.id, revision: 1, decision: "committed" })).toEqual({ ok: false, reason: "NOT_READY" })
  const committed = finishTrade({ player: a, record: record, id: proposal.id, revision: 1, decision: "committed" })
  if (!committed.ok) throw new Error(committed.reason)
  expect(finishTrade({ player: committed.player, record: committed.record, id: proposal.id, revision: 1, decision: "aborted" })).toEqual({ ok: false, reason: "NOT_READY" })
})

it("rejects overlapping reservations and stale requests after a later trade", () => {
  const first = prepared()
  const secondRequest = { ...proposal, id: "exchange-two", revision: 2 }
  expect(prepareTrade({ player: a, previous: first, proposal: secondRequest, now: 2 })).toEqual({ ok: false, reason: "NOT_READY" })
  const cancelled = finishTrade({ player: a, record: first, id: proposal.id, revision: 1, decision: "aborted" })
  if (!cancelled.ok) throw new Error(cancelled.reason)
  const second = prepared(a, secondRequest, cancelled.record)
  expect(prepareTrade({ player: a, previous: second, proposal: proposal, now: 3 })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(finishTrade({ player: a, record: second, id: proposal.id, revision: 1, decision: "committed" })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(prepareTrade({ player: a, previous: null, proposal: secondRequest, now: 3 })).toEqual({ ok: false, reason: "NOT_READY" })
})

it("rejects changed contents under the same transaction identity", () => {
  const record = prepared()
  for (const changed of [
    { ...proposal, gold: 100 },
    { ...proposal, incoming: [{ item: "jelly" as const, count: 3 }] },
    { ...proposal, offer: { ...proposal.offer, gold: 0 } },
    { ...proposal, id: "another-exchange" },
  ])
    expect(prepareTrade({ player: a, previous: record, proposal: changed, now: 2 })).toEqual({ ok: false, reason: "NOT_READY" })
})

it("rejects goods changed since confirmation and preserves tool quality, maker and wear", () => {
  const tool = { item: "wood-axe" as const, count: 1, q: 2 as const, by: "ペーター", dur: 5 }
  const owner = player({ bag: [tool, ...Array(BAG_SIZE - 1).fill(null)] })
  const request = { ...proposal, offer: { lots: [{ slot: 0, count: 1 }], gold: 0 }, outgoing: [tool], incoming: [] }
  expect(prepareTrade({ player: owner, previous: null, proposal: { ...request, outgoing: [{ ...tool, dur: 6 }] }, now: 1 })).toEqual({ ok: false, reason: "NOT_READY" })
  const receiver = player({ bag: bagWith() })
  const received = prepared(receiver, { ...request, offer: { lots: [], gold: 0 }, outgoing: [], incoming: [tool] })
  expect(received.inventory.bag[0]).toEqual(tool)
})

it("rejects insufficient gold and full bags before holding either inventory", () => {
  expect(prepareTrade({ player: a, previous: null, proposal: { ...proposal, offer: { ...proposal.offer, gold: 101 } }, now: 1 })).toEqual({ ok: false, reason: "NO_GOLD" })
  const full = player({ bag: Array.from({ length: BAG_SIZE }, () => ({ item: "log" as const, count: 99 })) })
  expect(prepareTrade({ player: full, previous: null, proposal: { ...proposal, offer: { lots: [], gold: 0 }, outgoing: [] }, now: 1 })).toEqual({ ok: false, reason: "BAG_FULL" })
})

it("committing preserves recovery and other unrelated player fields", () => {
  const record = prepared()
  const recovered = { ...a, hp: a.hp + 1, name: "エルナ" }
  const result = finishTrade({ player: recovered, record: record, id: proposal.id, revision: 1, decision: "committed" })
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
  const committed = finishTrade({ player: recipient, record: restored, id: request.id, revision: 1, decision: "committed" })
  if (!committed.ok) throw Error(committed.reason)
  expect(committed.player.bag.slice(0, 3)).toEqual([existing, ...goods])
  expect(recipient.bag[1]).toBeNull()
  const retry = finishTrade({ player: committed.player, record: committed.record, id: request.id, revision: 1, decision: "committed" })
  expect(retry).toEqual(committed)
})
