import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Button } from "#/components/game/button"
import { Panel } from "#/components/game/panel"

/** A player picked by name: trade, party, threads, or mute them in this browser. */
export function PlayerMenu() {
  const game = useGame()
  const menu = useGameState((s) => s.playerMenu)
  const muted = useGameState((s) => !!s.playerMenu && s.muted.includes(s.playerMenu.id))
  if (!menu) return null
  // over every window, under the dialogue and the notices (ui.md §2.1)
  return (
    <Panel className="pointer-events-auto absolute top-24 z-50 left-1/2 flex w-max max-w-[calc(100%-24px)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 p-2">
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
      {muted ? (
        <Button size="sm" onClick={() => game.unmute(menu.id)}>
          ミュートを解く
        </Button>
      ) : (
        <Button size="sm" onClick={() => game.mute(menu.id)}>
          ミュート
        </Button>
      )}
      <Button size="sm" onClick={() => game.closePlayerMenu()}>
        閉じる
      </Button>
    </Panel>
  )
}
