import { newPlayer } from "#/world/core/new-player"
import type { PlayerState } from "#/world/core/player-types"

/** A player who has been about a while: the starting gold is spent in town, so all their gold can change hands (handable-gold.ts). */
export const player = (patch: Partial<PlayerState> = {}): PlayerState => ({ ...newPlayer(), allowance: 0, ...patch })
