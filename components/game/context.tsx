// React's only link to the game: the context hands out the Game instance, and components read
// its state through a selector and call its methods. No game state lives in React.
import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react"
import type { Game, GameState } from "../../world/game.ts"

const GameContext = createContext<Game | null>(null)

export function GameProvider({ game, children }: { game: Game; children: ReactNode }) {
  return <GameContext value={game}>{children}</GameContext>
}

export function useGame(): Game {
  const game = useContext(GameContext)
  if (!game) throw new Error("useGame needs a <GameProvider>")
  return game
}

/** The player, where there is a game (a dev page shows items without one). */
export function usePlayerIfAny() {
  const game = useContext(GameContext)
  const read = () => game?.state.get().player ?? null
  return useSyncExternalStore(game ? game.state.subscribe : () => () => {}, read, read)
}

/** Read part of the game state. The selector must return a value already in the state (or a primitive). */
export function useGameState<T>(select: (state: GameState) => T): T {
  const game = useGame()
  const read = () => select(game.state.get())
  return useSyncExternalStore(game.state.subscribe, read, read)
}
