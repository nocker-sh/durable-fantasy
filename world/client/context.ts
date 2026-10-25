import type { GameSession } from "./session.ts"
import type { GameState, ChatLine, Notice, WindowId } from "../state.ts"
import type { Command } from "../core/commands.ts"
import type { Cell } from "../protocol.ts"
import type { MapId } from "../maps/index.ts"
import type { MapScene } from "../scene/index.ts"

/** Services supplied to each controller. Controllers receive only the keys they use. */
export interface GameContext {
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
