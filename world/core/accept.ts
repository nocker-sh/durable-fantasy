import type { GameEvent } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
import type { Transition } from "#/world/core/transition"

export function accept(state: PlayerState, ...events: GameEvent[]): Transition {
  return { ok: true, state, events }
}
