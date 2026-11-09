import { useEffect, useState } from "react"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Button } from "#/components/game/button"
import { Input } from "#/components/game/input"
import { Window } from "#/components/game/window"
import { Side } from "#/components/hud/side"
import { useServiceWindow } from "#/components/hud/use-service-window"
import { handableGold } from "#/world/core/handable-gold"
import { TRADE_GOLD_MAX } from "#/world/core/trade-rules"

export function TradeWindow() {
  const game = useGame()
  const trade = useGameState((s) => s.trade)
  const player = useGameState((s) => s.player)
  const goldState = useState(""),
    gold = goldState[0],
    setGold = goldState[1]
  // a new trade starts with no gold typed in, not the amount left from the last one
  const trading = !!trade
  useEffect(() => setGold(""), [trading])
  const stack = useServiceWindow("trade", !!trade && !!player)
  if (!trade || !player) return null
  const mineSource = trade,
    mine = mineSource.mine,
    theirs = mineSource.theirs,
    lots = mineSource.lots
  // no more than is carried, nor than a side may put up (core/trade-rules.ts)
  const g = Math.min(handableGold(player), TRADE_GOLD_MAX, Number(gold) || 0)
  return (
    <Window
      id="trade"
      title={`${trade.name}との取引`}
      z={stack.z}
      onFocus={stack.onFocus}
      onClose={() => game.cancelTrade()}
      initial={(w) => ({ x: Math.max(12, w / 2 - 260), y: 110 })}
      className="w-[520px]"
    >
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
