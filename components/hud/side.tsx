import { ITEMS } from "#/world/core/items/catalog"
import { displayName } from "#/world/core/display-name"
import { TRADE_LOTS } from "#/world/core/trade-rules"
import type { TradeSideView } from "#/world/protocol"
import { useGame } from "#/hooks/use-game"
import { Gold } from "#/components/game/gold"
import { Slot } from "#/components/game/slot"
import { ItemTooltip } from "#/components/hud/item-tooltip"

export function Side(inputProps: { title: string; side: TradeSideView; onPick?: (i: number) => void }) {
  const title = inputProps.title
  const side = inputProps.side
  const onPick = inputProps.onPick

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
