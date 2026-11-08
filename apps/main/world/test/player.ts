import { newPlayer } from "#/world/core/new-player"
import type { PlayerState } from "#/world/core/player-types"

export const player = (patch: Partial<PlayerState> = {}): PlayerState => ({ ...newPlayer(), ...patch })
