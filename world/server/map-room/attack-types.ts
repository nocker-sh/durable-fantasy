import type { Ctx, Message } from "#/world/server/map-room/context"
import type { Wild } from "#/durable-objects/wild"
import type { StrikeResult } from "#/world/server/wild-coordinator"
import type { PlayerState } from "#/world/core/player-types"
import type { Spawn } from "#/world/core/monster-types"
import type { Fighter, Swing } from "#/world/core/combat-types"

export type PreparedMapAttack = Readonly<{ owner: string; playerId: string; spawn: Spawn; now: number; data: PlayerState; life: number; defense: Fighter; blow: Swing }>

export type MapStrikePublication = Readonly<{
  room: Ctx
  message: Message<"attack">
  attack: PreparedMapAttack
  wild: ReturnType<typeof Wild.get>
  id: number
  result: StrikeResult
}>
