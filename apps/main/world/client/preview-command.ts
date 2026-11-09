import { serverNow } from "#/world/client/server-now"
import { apply } from "#/world/core/apply"
import type { Command, Reason } from "#/world/core/commands"
import type { GameState } from "#/world/state"

/** 送らずに結果だけを見る（ボタンを灰色にするため）。待ち時間はサーバーの時計で数え、端末の時計のずれで断らない。 */
export function previewCommand(state: Pick<GameState, "player" | "clockOffset">, command: Command): Reason | null {
  const player = state.player
  if (!player) return "OFFLINE"
  const result = apply(player, command, { now: serverNow(state), price: command.type === "buy" ? command.price : undefined })
  return result.ok ? null : result.reason
}
