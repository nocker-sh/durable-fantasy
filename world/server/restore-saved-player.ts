import { parsePlayer } from "#/world/core/parse-player"
import type { PlayerState } from "#/world/core/player-types"

export function restoreSavedPlayer(saved: unknown): PlayerState {
  const player = parsePlayer(saved)
  if (!player) throw new Error("Saved player data is unreadable")
  return player
}
