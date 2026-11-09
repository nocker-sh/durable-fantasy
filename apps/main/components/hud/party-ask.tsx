import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Button } from "#/components/game/button"
import { Panel } from "#/components/game/panel"

/** Someone asks us into their party. */
export function PartyAsk() {
  const game = useGame()
  const ask = useGameState((s) => s.partyAsk)
  if (!ask) return null
  // over every window, under the dialogue and the notices: Esc answers it first (ui.md §2.1)
  return (
    <Panel className="pointer-events-auto absolute top-36 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 p-2">
      <span className="font-body text-[13px]">{ask.name}からパーティの誘い</span>
      <Button size="sm" variant="primary" onClick={() => game.answerParty(true)}>
        入る
      </Button>
      <Button size="sm" onClick={() => game.answerParty(false)}>
        断る
      </Button>
    </Panel>
  )
}
