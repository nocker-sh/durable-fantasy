import { createContext } from "react"
import type { Game } from "#/world/game"

/** React はゲームの参照だけを共有し、ゲームの状態を所有しない。 */
export const GameContext = createContext<Game | null>(null)
