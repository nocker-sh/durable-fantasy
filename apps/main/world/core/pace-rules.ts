// How often one player may do something that reaches other people (game-system.md §12, §14).
// Kept per player, not per connection, so walking into another map or reconnecting does not reset it.

/** asking someone to trade, to join a party, or to swap threads: one ask of any kind per this many ms */
export const ASK_GAP_MS = 5_000

/** shouting to the whole map: once per this many ms */
export const SHOUT_GAP_MS = 30_000

/** looking up the party's state (the client asks every five seconds) */
export const PARTY_LOOK_GAP_MS = 4_000

export type PaceKind = "ask" | "shout"
