import type { GameContext } from "./context"
import type { Cell, MapPlayer, ServerMessage } from "#/world/protocol"
import type { MapId } from "#/world/maps/types"
import type { GameEvent, Command, Reason } from "../core/commands"
import type { PlayerState } from "#/world/core/player-types"
import type { Avatar } from "#/world/scene/runtime/types"

/** Effects of server messages on the active session. */
export type ServerMessageContext = GameContext & {
  preview(command: Command): Reason | null
  onServer(message: ServerMessage): void
  wayBeside(at: Cell | null): MapId | null
  standBy(id: MapId): void
  avatarOf(player: MapPlayer): Avatar
  setPlayer(player: PlayerState): void
  maybeReady(): void
  report(event: GameEvent): void
  connect(id: MapId): Promise<void>
  visitTown(town: number): void
}
