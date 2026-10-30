// Shared result of an authoritative game command. Rejection carries no replacement state.
import type { GameEvent, Reason } from "./commands"
import type { PlayerState } from "#/world/core/player-types"

export type Transition = { readonly ok: true; readonly state: PlayerState; readonly events: readonly GameEvent[] } | { readonly ok: false; readonly reason: Reason }
