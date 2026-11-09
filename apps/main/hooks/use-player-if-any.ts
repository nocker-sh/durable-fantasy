import { useContext, useSyncExternalStore } from "react"
import { GameContext } from "#/components/game/game-context"

/** ゲームを持たない開発画面でも、同じ道具の表示を使えるようにする。 */
export function usePlayerIfAny() {
  const game = useContext(GameContext)
  const read = () => game?.state.get().player ?? null
  return useSyncExternalStore(game ? game.state.subscribe : () => () => {}, read, read)
}
