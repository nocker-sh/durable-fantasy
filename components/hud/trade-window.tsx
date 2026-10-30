import { useState } from "react"
import { TRADE_LOTS } from "#/world/core/trade-rules"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Button } from "#/components/game/button"
import { Input } from "#/components/game/input"
import { Window } from "#/components/game/window"
import { Side } from "#/components/hud/side"

export function TradeWindow() {
  const game = useGame()
  const trade = useGameState((s) => s.trade)
  const player = useGameState((s) => s.player)
  const goldState = useState(""),
    gold = goldState[0],
    setGold = goldState[1]
  if (!trade || !player) return null
  const mineSource = trade,
    mine = mineSource.mine,
    theirs = mineSource.theirs,
    lots = mineSource.lots
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
