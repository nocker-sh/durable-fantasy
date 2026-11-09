import type { GameState } from "#/world/state"

/** サーバーの時計で今の時刻（ms）。端末の時計に、部屋が入室時に知らせた差を足す（game-system.md §7.5）。 */
export function serverNow(state: Pick<GameState, "clockOffset">, local = Date.now()): number {
  return local + state.clockOffset
}
