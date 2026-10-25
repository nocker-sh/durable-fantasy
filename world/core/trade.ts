// Trading face to face (game-system.md §11): two players standing together each put up things from
// their bags and some gold; when both have settled and both say "exchange", the goods change hands.
// Their data live in two Durable Objects, so the room takes each side's goods first and hands them
// over after, checking beforehand (here, pure) that both sides can give and take.
import { apply } from "./apply.ts";
import type { Stack } from "./bag.ts";
import type { Reason } from "./commands.ts";
import type { PlayerState } from "./player.ts";

/** At most this many lots each side may put up. */
export const TRADE_LOTS = 8;
/** How close two players must stand to trade, in cells. */
export const TRADE_CELLS = 6;

/** What one side puts up: lots from their bag, and gold. */
export interface Offer {
  lots: readonly { slot: number; count: number }[];
  gold: number;
}
export const emptyOffer = (): Offer => ({ lots: [], gold: 0 });

/**
 * Would the trade go through: can each side give what they put up, and take in what the other put
 * up (room in the bag, weight)? The reason it would not, or null.
 */
export function checkTrade(a: PlayerState, offerA: Offer, b: PlayerState, offerB: Offer, now: number): Reason | null {
  const outA = apply(a, { type: "trade-out", offer: offerA }, { now });
  if (!outA.ok) return outA.reason;
  const outB = apply(b, { type: "trade-out", offer: offerB }, { now });
  if (!outB.ok) return outB.reason;
  const inA = apply(outA.state, { type: "trade-in", stacks: takenOf(outB.events), gold: offerB.gold }, { now });
  if (!inA.ok) return inA.reason;
  const inB = apply(outB.state, { type: "trade-in", stacks: takenOf(outA.events), gold: offerA.gold }, { now });
  if (!inB.ok) return inB.reason;
  return null;
}

/** The lots a trade-out took, from its event. */
export function takenOf(events: readonly { type: string }[]): Stack[] {
  const e = events.find((x): x is { type: "traded-out"; stacks: Stack[]; gold: number } => x.type === "traded-out");
  return e ? e.stacks : [];
}
