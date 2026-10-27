// Shared result of an authoritative game command. Rejection carries no replacement state.
import type { GameEvent, Reason } from "./commands.ts"
import type { PlayerState } from "./player.ts"

export type Transition = { readonly ok: true; readonly state: PlayerState; readonly events: readonly GameEvent[] } | { readonly ok: false; readonly reason: Reason }

export const accept = (state: PlayerState, ...events: GameEvent[]): Transition => ({ ok: true, state, events })
export const reject = (reason: Reason): Transition => ({ ok: false, reason })
