// A participant's durable trade record. Preparing reserves a complete, validated exchange;
// the coordinator must persist its decision before asking either participant to finish.
import { apply } from "./apply.ts"
import type { Bag, Stack } from "./bag.ts"
import type { Reason } from "./commands.ts"
import type { PlayerState } from "./player.ts"
import { takenOf, type Offer } from "./trade.ts"

export interface TradeProposal {
  id: string
  /** Strictly increasing per participant; stale RPC retries cannot start an old trade again. */
  revision: number
  offer: Offer
  /** The exact offered goods both players confirmed, including wear and maker. */
  outgoing: readonly Stack[]
  incoming: readonly Stack[]
  gold: number
}

export interface TradeRecord {
  proposal: TradeProposal
  status: "prepared" | "committed" | "aborted"
  /** Prepared inventory, never a whole-player snapshot that could overwrite HP or location. */
  inventory: { bag: Bag; gold: number }
}

type Failure = { ok: false; reason: Reason }
type Prepared = { ok: true; record: TradeRecord }

export const sameStacks = (a: readonly Stack[], b: readonly Stack[]) =>
  a.length === b.length &&
  a.every((s, i) => {
    const t = b[i]
    return s.item === t.item && s.count === t.count && s.q === t.q && s.by === t.by && s.dur === t.dur
  })

export function sameProposal(a: TradeProposal, b: TradeProposal): boolean {
  return (
    a.id === b.id &&
    a.revision === b.revision &&
    a.gold === b.gold &&
    a.offer.gold === b.offer.gold &&
    a.offer.lots.length === b.offer.lots.length &&
    a.offer.lots.every((lot, i) => lot.slot === b.offer.lots[i].slot && lot.count === b.offer.lots[i].count) &&
    sameStacks(a.outgoing, b.outgoing) &&
    sameStacks(a.incoming, b.incoming)
  )
}

/** Caller must reject inventory-changing commands while a record is prepared. */
export function prepareTrade(player: PlayerState, previous: TradeRecord | null, proposal: TradeProposal, now: number): Prepared | Failure {
  if (previous && proposal.revision === previous.proposal.revision) {
    return sameProposal(proposal, previous.proposal) ? { ok: true, record: previous } : { ok: false, reason: "NOT_READY" }
  }
  if (previous?.status === "prepared" || !Number.isSafeInteger(proposal.revision) || proposal.revision !== (previous?.proposal.revision ?? 0) + 1 || !proposal.id) {
    return { ok: false, reason: "NOT_READY" }
  }
  if (!Number.isSafeInteger(proposal.gold) || proposal.gold < 0) return { ok: false, reason: "NO_GOLD" }
  const out = apply(player, { type: "trade-out", offer: proposal.offer }, { now })
  if (!out.ok) return out
  if (!sameStacks(takenOf(out.events), proposal.outgoing)) return { ok: false, reason: "NOT_READY" }
  const incoming = apply(out.state, { type: "trade-in", stacks: proposal.incoming, gold: proposal.gold }, { now })
  if (!incoming.ok) return incoming
  return {
    ok: true,
    record: { proposal: structuredClone(proposal), status: "prepared", inventory: { bag: incoming.state.bag, gold: incoming.state.gold } },
  }
}

/** Repeated decisions are harmless; an opposite decision or an old revision cannot alter goods. */
export function finishTrade(
  player: PlayerState,
  record: TradeRecord | null,
  id: string,
  revision: number,
  decision: "committed" | "aborted",
): { ok: true; player: PlayerState; record: TradeRecord } | Failure {
  if (!record || record.proposal.id !== id || record.proposal.revision !== revision) return { ok: false, reason: "NOT_READY" }
  if (record.status !== "prepared") return record.status === decision ? { ok: true, player, record } : { ok: false, reason: "NOT_READY" }
  return { ok: true, player: decision === "committed" ? { ...player, ...record.inventory } : player, record: { ...record, status: decision } }
}
