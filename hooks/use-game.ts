import { useContext } from "react"
import { GameContext } from "#/components/game/game-context"
import type { Game } from "#/world/game"

export function useGame(): Game {
  const game = useContext(GameContext)
  if (!game) throw new Error("useGame needs a <GameProvider>")
  return game
}
