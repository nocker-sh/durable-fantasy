// Trading face to face (game-system.md §11, core/trade.ts): pick a player by name to ask; what each
// side puts up shows on both sides; both settle ("決定"), then both press "交換".
import { useState } from "react"
import { ITEMS } from "#/world/core/items.ts"
import { displayName } from "#/world/core/makers.ts"
import { TRADE_LOTS } from "#/world/core/trade.ts"
import type { TradeSideView } from "#/world/protocol.ts"
import { useGame, useGameState } from "#/components/game/context.tsx"
import { Button } from "#/components/game/button.tsx"
import { Gold } from "#/components/game/gold.tsx"
import { Input } from "#/components/game/input.tsx"
import { Panel } from "#/components/game/panel.tsx"
import { Slot } from "#/components/game/slot.tsx"
import { Window } from "#/components/game/window.tsx"
import { ItemTooltip } from "./item-tooltip.tsx"

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

function Side({ title, side, onPick }: { title: string; side: TradeSideView; onPick?: (i: number) => void }) {
  const game = useGame()
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <div className="flex items-center justify-between font-head text-xs">
        <span className="truncate text-brass-hi">{title}</span>
        {side.done ? <span className="text-good">交換を押した</span> : side.locked ? <span className="text-good">決めた</span> : <span className="text-text-faint">考え中</span>}
      </div>
      <div className={`ui-well grid grid-cols-4 gap-1 p-1.5 ${side.locked ? "shadow-[inset_0_0_0_1px_var(--color-good)]" : ""}`}>
        {Array.from({ length: TRADE_LOTS }, (_, i) => side.stacks[i] ?? null).map((s, i) => (
          <ItemTooltip key={i} item={s?.item} mark={s ?? undefined} side="left" hint={s && onPick ? "右クリックで下げる" : undefined}>
            <Slot
              icon={s ? game.iconUrl(s.item, s.by) : null}
              rarity={s ? ITEMS[s.item].rarity : undefined}
              count={s?.count}
              aria-label={s ? `${displayName(s.item, s.by)} ×${s.count}` : "空き"}
              onContextMenu={(e) => {
                e.preventDefault()
                if (s && onPick) onPick(i)
              }}
            />
          </ItemTooltip>
        ))}
      </div>
      <Gold amount={side.gold} className="text-xs text-text-dim" />
    </div>
  )
}

export function TradeWindow() {
  const game = useGame()
  const trade = useGameState((s) => s.trade)
  const player = useGameState((s) => s.player)
  const [gold, setGold] = useState("")
  if (!trade || !player) return null
  const { mine, theirs, lots } = trade
  const g = Math.min(player.gold, Number(gold) || 0)
  return (
    <Window id="trade" title={`${trade.name}との取引`} z={35} onClose={() => game.cancelTrade()} initial={(w) => ({ x: Math.max(12, w / 2 - 260), y: 110 })} className="w-[520px]">
      <div className="flex gap-3">
        <Side
          title="あなたが出すもの"
          side={mine}
          onPick={
            mine.locked
              ? undefined
              : (i) =>
                  game.offerTrade(
                    lots.filter((_, k) => k !== i),
                    mine.gold,
                  )
          }
        />
        <Side title={`${trade.name}が出すもの`} side={theirs} />
      </div>
      <p className="mt-2 font-body text-[12px] text-text-dim">持ち物を右クリックすると、取引に出せる（{TRADE_LOTS}つまで）。どちらかが出す物を変えると、決定は取り消される。</p>
      <div className="mt-2 flex items-center gap-2 font-head text-xs">
        <label className="flex items-center gap-1.5 text-text-dim">
          お金 <Input value={gold} placeholder={String(mine.gold)} disabled={mine.locked} onChange={(e) => setGold(e.target.value.replace(/\D/g, ""))} className="h-7 w-24 text-xs" />G
        </label>
        <Button size="sm" disabled={mine.locked || g === mine.gold} onClick={() => game.offerTrade(lots, g)}>
          置く
        </Button>
        <div className="ml-auto flex gap-1.5">
          <Button size="sm" disabled={mine.locked} onClick={() => game.lockTrade()}>
            決定
          </Button>
          <Button size="sm" variant="primary" disabled={!mine.locked || !theirs.locked || mine.done} onClick={() => game.goTrade()}>
            交換
          </Button>
          <Button size="sm" onClick={() => game.cancelTrade()}>
            やめる
          </Button>
        </div>
      </div>
    </Window>
  )
}
