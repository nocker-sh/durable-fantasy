import type { Ctx, Message } from "#/world/server/map-room/context"
import type { Wild } from "#/durable-objects/wild"
import type { StrikeResult } from "#/world/server/wild-coordinator"
import type { PlayerState } from "#/world/core/player-types"
import type { Spawn } from "#/world/core/monster-types"
import type { Fighter, Swing } from "#/world/core/combat-types"

type Connection = Pick<Ctx["ctx"]["connection"], "state" | "send">
export type AttackRequestContext = Readonly<
  Pick<Ctx, "me" | "save" | "standUp"> & {
    key: Pick<Ctx["key"], "map">
    map: Pick<Ctx["map"], "size" | "rows">
    ctx: Readonly<{
      params: Ctx["ctx"]["params"]
      connection: Pick<Connection, "send">
      room: Pick<Ctx["ctx"]["room"], "broadcast"> & { getConnections(): Iterable<Connection> }
    }>
  }
>

export type PreparedMapAttack = Readonly<{ owner: string; playerId: string; spawn: Spawn; now: number; data: Pick<PlayerState, "party" | "level">; life: number; defense: Fighter; blow: Swing }>

export type MapStrikePublication = Readonly<{
  room: AttackRequestContext
  message: Message<"attack">
  attack: PreparedMapAttack
  wild: Pick<ReturnType<typeof Wild.get>, "deliverStrike">
  id: number
  result: StrikeResult
}>
