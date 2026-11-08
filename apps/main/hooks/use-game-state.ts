import { useSyncExternalStore } from "react"
import { useGame } from "#/hooks/use-game"
import type { GameState } from "#/world/state"

/** セレクターは状態内の参照かプリミティブを返し、スナップショットを作り直さない。 */
export function useGameState<T>(select: (state: GameState) => T): T {
  const game = useGame()
  const read = () => select(game.state.get())
  return useSyncExternalStore(game.state.subscribe, read, read)
}
