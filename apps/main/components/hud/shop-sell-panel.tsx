import { useEffect, useState } from "react"
import { REASON_TEXT } from "#/world/core/commands"
import { ITEMS } from "#/world/core/items/catalog"
import { QUALITIES } from "#/world/core/items/kinds"
import { sellsFor } from "#/world/core/sells-for"
import { buybackOf } from "#/world/core/buyback-of"
import { bulkBuyingPrice } from "#/world/core/bulk-buying-price"
import { shopRate } from "#/world/core/shop-rate"
import { shopTakes } from "#/world/core/shop-takes"
import { displayName } from "#/world/core/display-name"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Button } from "#/components/game/button"
import { Gold } from "#/components/game/gold"
import { Slot } from "#/components/game/slot"
import { Stepper } from "#/components/game/stepper"
import { ItemTooltip } from "#/components/hud/item-tooltip"

type Props = { picked: number | null; onPick: (slot: number | null) => void }

export function ShopSellPanel(props: Props) {
  const picked = props.picked
  const onPick = props.onPick

  const game = useGame()
  const shop = useGameState((s) => s.shop)
  const player = useGameState((s) => s.player)
  const busy = useGameState((s) => s.busy)
  const countState2 = useState(1),
    count = countState2[0],
    setCount = countState2[1]
  const stock = useGameState((s) => s.stock)
  const bag = player?.bag ?? []
  const stack = picked !== null ? bag[picked] : null
  // what the shop pays per one for this many now (by its stock, as the server prices it), else at its usual stock
  const each = (s: NonNullable<typeof stack>, n: number) => {
    const held = stock?.shop === shop ? stock.held[s.item] : undefined
    return held === undefined ? sellsFor(shop!, s) : buybackOf(bulkBuyingPrice({ item: s.item, stock: held, rate: shopRate(shop!, s.item), count: n }), s)
  }
  useEffect(() => setCount(1), [picked])
  return (
    <div className="flex flex-col gap-2.5">
      <div className="ui-well grid grid-cols-6 gap-1 p-1.5">
        {bag.map((s, index) => (
          <ItemTooltip key={index} item={s?.item} mark={s} side="left" note={s && !shopTakes(shop!, s.item) ? REASON_TEXT.NOT_WANTED : undefined}>
            <Slot
              icon={s ? game.iconUrl(s.item, s.by) : null}
              rarity={s ? ITEMS[s.item].rarity : undefined}
              count={s?.count}
              dim={!!s && !shopTakes(shop!, s.item)}
              over={picked === index}
              disabled={!s || !shopTakes(shop!, s.item)}
              aria-label={s ? displayName(s.item, s.by) : "空き"}
              aria-description={s && !shopTakes(shop!, s.item) ? REASON_TEXT.NOT_WANTED : undefined}
              onClick={() => onPick(index)}
              className="disabled:cursor-default"
            />
          </ItemTooltip>
        ))}
      </div>
      <div className="flex h-9 items-center gap-2.5 font-body text-[13px]">
        {stack ? (
          <>
            <span className="min-w-0 flex-1 truncate">
              {displayName(stack.item, stack.by)}
              {ITEMS[stack.item].made && `（${QUALITIES[stack.q ?? 1]}）`}
            </span>
            {shopTakes(shop!, stack.item) ? (
              <Gold amount={each(stack, Math.min(count, stack.count)) * Math.min(count, stack.count)} className="text-xs" />
            ) : (
              <span className="font-head text-[11px] text-bad">{REASON_TEXT.NOT_WANTED}</span>
            )}
            <Stepper value={Math.min(count, stack.count)} max={stack.count} onChange={setCount} />
            <Button
              variant="primary"
              size="sm"
              disabled={busy || !shopTakes(shop!, stack.item)}
              onClick={() => {
                game.sell({ shop: shop!, slot: picked!, count: Math.min(count, stack.count), expectedStack: stack })
                if (game.state.get().shop === shop && Math.min(count, stack.count) === stack.count) onPick(null)
              }}
            >
              売る
            </Button>
          </>
        ) : null}
      </div>
    </div>
  )
}
