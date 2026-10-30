import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Button } from "#/components/game/button"
import { Panel } from "#/components/game/panel"

/** Someone offers to swap muffler threads. */
export function ThreadAsk() {
  const game = useGame()
  const ask = useGameState((s) => s.threadAsk)
  if (!ask) return null
  return (
    <Panel className="pointer-events-auto absolute top-48 left-1/2 flex -translate-x-1/2 items-center gap-2 p-2">
      <span className="font-body text-[13px]">{ask.name}がマフラーの糸の交換を申し出ている</span>
      <Button size="sm" variant="primary" onClick={() => game.answerThread(true)}>
        交換する
      </Button>
      <Button size="sm" onClick={() => game.answerThread(false)}>
        断る
      </Button>
    </Panel>
  )
}
