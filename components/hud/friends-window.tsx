// Friends (world.md "マフラー", core/threads.ts): those you have swapped muffler threads with, and
// their towns. Follow a thread across into a friend's town; your own muffler brings you home.
import { useGame, useGameState } from "#/components/game/context.tsx"
import { Button } from "#/components/game/button.tsx"
import { Panel } from "#/components/game/panel.tsx"
import { Window } from "#/components/game/window.tsx"
import { useWindow } from "./use-window.ts"

export function FriendsWindow() {
  const game = useGame()
  const win = useWindow("friends")
  const player = useGameState((s) => s.player)
  const room = useGameState((s) => s.room)
  const home = useGameState((s) => s.homeTown)
  if (!win.open || !player) return null
  const here = room?.world ?? home
  const threads = [...player.threads].reverse()
  return (
    <Window id="friends" title="糸をつないだ人" hotkey="F" {...win.props} key={win.key} initial={(w) => ({ x: Math.max(12, w - 640), y: 160 })} className="w-[300px]">
      <div className="mb-2 flex items-center justify-between font-head text-xs">
        <span className="text-text-dim">
          いま: 町{here}
          {here === home ? "（自分の町）" : "（訪ねている）"}
        </span>
        {here !== home && (
          <Button size="sm" variant="primary" onClick={() => game.visitTown(home)}>
            自分の町へ帰る
          </Button>
        )}
      </div>
      <ul className="ui-scroll flex max-h-64 flex-col gap-1 overflow-y-auto pr-1">
        {threads.map((t) => (
          <li key={t.key} className="ui-well flex items-center gap-2 px-2 py-1">
            <span className="min-w-0 flex-1 truncate font-body text-[13px]">{t.name}</span>
            <span className="font-head text-[11px] text-text-dim">町{t.town}</span>
            <Button size="sm" disabled={t.town === here} onClick={() => game.visitTown(t.town)}>
              {t.town === here ? "ここ" : "糸をたどる"}
            </Button>
          </li>
        ))}
        {!threads.length && <li className="font-body text-[12px] text-text-faint">まだ誰とも糸を交換していない。別れ際、そばにいる人の名札を押すと、マフラーの糸を交換できる。</li>}
      </ul>
    </Window>
  )
}

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
