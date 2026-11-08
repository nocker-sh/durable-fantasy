import type { PlayerState } from "#/world/core/player-types"
import { parsePlayer } from "#/world/core/parse-player"
import { newPlayer } from "#/world/core/new-player"

/** Compatibility loader for callers explicitly allowing a new player on unreadable input. */
export function loadPlayer(saved: unknown): PlayerState {
  return parsePlayer(saved) ?? newPlayer()
}
