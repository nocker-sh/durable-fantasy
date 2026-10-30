import type { PlayerState } from "#/world/core/player-types"

/** 温まりは終了時刻の直前まで有効にする。 */
export function warmNow(player: Pick<PlayerState, "warmUntil">, now: number): boolean {
  return player.warmUntil > now
}
