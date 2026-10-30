import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Button } from "#/components/game/button"
import { Panel } from "#/components/game/panel"

/** A player picked by name: ask them to trade. */
export function PlayerMenu() {
  const game = useGame()
  const menu = useGameState((s) => s.playerMenu)
  if (!menu) return null
  return (
    <Panel className="pointer-events-auto absolute top-24 left-1/2 flex -translate-x-1/2 items-center gap-2 p-2">
      <span className="font-head text-sm text-brass-hi">{menu.name}</span>
      <Button size="sm" variant="primary" onClick={() => game.askTrade(menu.id)}>
        取引を申し込む
      </Button>
      <Button size="sm" variant="primary" onClick={() => game.inviteParty(menu.id)}>
        パーティに誘う
      </Button>
      <Button size="sm" variant="primary" onClick={() => game.askThread(menu.id)}>
        糸を交換する
      </Button>
      <Button size="sm" onClick={() => game.closePlayerMenu()}>
        閉じる
      </Button>
    </Panel>
  )
}
