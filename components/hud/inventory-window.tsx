// The bag (ui.md §3.7): 6 × 4 slots of 48px. Drag to rearrange or onto the shortcut bar,
// double-click to use or wear; with a shop open, right-click picks the item to sell.
import { displayName } from "#/world/core/display-name"
import { useState, type DragEvent } from "react"
import { BAG_SIZE } from "#/world/core/bag-rules"
import { ITEMS } from "#/world/core/items/catalog"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Gold } from "#/components/game/gold"
import { Slot } from "#/components/game/slot"
import { Window } from "#/components/game/window"
import { ItemTooltip } from "./item-tooltip"
import { carriesItem } from "#/components/hud/carries-item"
import { readDrag } from "#/components/hud/read-drag"
import { startDrag } from "#/components/hud/start-drag"
import { useWindow } from "./use-window"

export function InventoryWindow() {
  const game = useGame()
  const win = useWindow("inventory")
  const player = useGameState((s) => s.player)
  const derived = useGameState((s) => s.derived)
  const shop = useGameState((s) => s.shop)
  const storage = useGameState((s) => s.storage)
  const trade = useGameState((s) => s.trade)
  const overState = useState<number | null>(null),
    over = overState[0],
    setOver = overState[1]
  if (!win.open) return null
  const bag = player?.bag ?? Array.from({ length: BAG_SIZE }, () => null)

  const drop = (index: number) => (event: DragEvent) => {
    event.preventDefault()
    setOver(null)
    const drag = readDrag(event)
    if (!drag) return
    if ("slot" in drag) game.moveSlot(drag.slot, index, drag.stack)
    else if ("worn" in drag) game.unequip(drag.worn, drag.stack)
  }

  return (
    <Window
      id="inventory"
      title="持ち物"
      hotkey="I"
      key={win.key}
      {...win.props}
      initial={(w, h) => ({ x: w - 352, y: Math.max(230, h - 470) })}
      footer={
        <div className="flex items-center justify-between font-head text-xs">
          <Gold amount={player?.gold ?? 0} className="text-[13px] text-text" />
          <span className="text-text-dim tabular-nums">
            重さ {derived?.weight ?? 0} / {derived?.maxWeight ?? 0}
          </span>
        </div>
      }
    >
      <div className="ui-well grid grid-cols-6 gap-1 p-1.5">
        {bag.map((stack, index) => (
          <ItemTooltip
            key={index}
            item={stack?.item}
            mark={stack}
            side="left"
            hint={
              stack &&
              (trade
                ? "右クリックで取引に出す"
                : storage
                  ? "右クリックで倉庫に預ける"
                  : shop
                    ? "右クリックで売る品に選ぶ"
                    : ITEMS[stack.item].equip
                      ? "ダブルクリックで装備"
                      : "ダブルクリックで使う · ショートカットへドラッグ")
            }
          >
            <Slot
              icon={stack ? game.iconUrl(stack.item, stack.by) : null}
              rarity={stack ? ITEMS[stack.item].rarity : undefined}
              count={stack?.count}
              over={over === index}
              draggable={!!stack}
              aria-label={stack ? `${displayName(stack.item, stack.by)} ×${stack.count}` : "空き"}
              onDragStart={(e) => stack && startDrag(e, { item: stack.item, slot: index, stack }, game.iconUrl(stack.item))}
              onDragOver={(e) => {
                if (!carriesItem(e)) return
                e.preventDefault()
                setOver(index)
              }}
              onDragLeave={() => setOver(null)}
              onDrop={drop(index)}
              onDoubleClick={() => game.useSlot(index)}
              onContextMenu={(e) => {
                e.preventDefault()
                if (stack && trade) {
                  if (!trade.mine.locked && !trade.lots.some((l) => l.slot === index)) game.offerTrade([...trade.lots, { slot: index, count: stack.count }], trade.mine.gold)
                } else if (stack && storage) game.store(index, stack.count)
                else if (stack && shop) window.dispatchEvent(new CustomEvent("ui:sell-pick", { detail: index }))
              }}
            />
          </ItemTooltip>
        ))}
      </div>
    </Window>
  )
}
