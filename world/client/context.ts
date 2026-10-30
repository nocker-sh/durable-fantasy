import type { GameSession } from "#/world/client/game-session"
import type { GameState, ChatLine, Notice, WindowId } from "#/world/state"
import type { Command } from "../core/commands"
import type { Cell } from "#/world/protocol"
import type { MapId } from "#/world/maps/types"
import type { MapScene } from "#/world/scene/runtime/scene"

/** Services supplied to each controller. Controllers receive only the keys they use. */
export type GameContext = {
  readonly session: GameSession
  getScene(): MapScene | null
  update(patch: Partial<GameState> | ((state: GameState) => Partial<GameState>)): void
  run(command: Command, send?: (seq: number) => void): Promise<boolean>
  notify(text: string, tone?: Notice["tone"]): void
  addChat(line: Omit<ChatLine, "id">): void
  toggleWindow(id: WindowId): void
  lookAtShop(): void
  enterMap(id: MapId, at: Cell | null): void
}
