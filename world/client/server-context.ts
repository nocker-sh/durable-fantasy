import type { GameContext } from "./context.ts";
import type { Cell, MapPlayer, ServerMessage } from "../protocol.ts";
import type { MapId } from "../maps/index.ts";
import type { GameEvent, Command, Reason } from "../core/commands.ts";
import type { PlayerState } from "../core/player.ts";
import type { Avatar } from "../scene/index.ts";

/** Effects of server messages on the active session. */
export interface ServerMessageContext extends GameContext {
  preview(command: Command): Reason | null;
  onServer(message: ServerMessage): void;
  wayBeside(at: Cell | null): MapId | null;
  standBy(id: MapId): void;
  avatarOf(player: MapPlayer): Avatar;
  setPlayer(player: PlayerState): void;
  maybeReady(): void;
  report(event: GameEvent): void;
  connect(id: MapId): Promise<void>;
  visitTown(town: number): void;
}
