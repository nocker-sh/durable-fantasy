import { DIGEST_MS } from "#/world/core/player-rules"
import type { PlayerState } from "#/world/core/player-types"

/** サーバーの時刻までに減った満腹を、元の記録を変えずに求める。 */
export function fullNow(player: Pick<PlayerState, "full" | "fullAt">, now: number): number {
  return Math.max(0, player.full - Math.floor(Math.max(0, now - player.fullAt) / DIGEST_MS))
}
