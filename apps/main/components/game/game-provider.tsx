import type { ReactNode } from "react"
import type { Game } from "#/world/game"
import { GameContext } from "#/components/game/game-context"

type Props = Readonly<{ game: Game; children: ReactNode }>

/** 同じゲームの参照を HUD と開発用の表示へ渡す。 */
export function GameProvider(props: Props) {
  return <GameContext value={props.game}>{props.children}</GameContext>
}
