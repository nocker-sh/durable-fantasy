import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Button } from "#/components/game/button"
import { Panel } from "#/components/game/panel"

/** Someone asks to trade. */
export function TradeAsk() {
  const game = useGame()
  const ask = useGameState((s) => s.tradeAsk)
  if (!ask) return null
  return (
    <Panel className="pointer-events-auto absolute top-24 left-1/2 flex -translate-x-1/2 items-center gap-2 p-2">
      <span className="font-body text-[13px]">{ask.name}から取引の申し込み</span>
      <Button size="sm" variant="primary" onClick={() => game.answerTrade(true)}>
        受ける
      </Button>
      <Button size="sm" onClick={() => game.answerTrade(false)}>
        断る
      </Button>
    </Panel>
  )
}
