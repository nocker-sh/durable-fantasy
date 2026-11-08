// The bag (ui.md §3.7): 6 × 4 slots of 48px. Drag to rearrange or onto the shortcut bar,
// double-click to use or wear; with a shop open, right-click picks the item to sell, and with
// nothing else open it offers to throw the item away.
import { displayName } from "#/world/core/display-name"
import { useState, type DragEvent } from "react"
import { BAG_SIZE } from "#/world/core/bag-rules"
import { ITEMS } from "#/world/core/items/catalog"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Button } from "#/components/game/button"
import { Gold } from "#/components/game/gold"
import { Slot } from "#/components/game/slot"
import { Window } from "#/components/game/window"
import { ItemTooltip } from "#/components/hud/item-tooltip"
import { carriesItem } from "#/components/hud/carries-item"
import { readDrag } from "#/components/hud/read-drag"
import { startDrag } from "#/components/hud/start-drag"
import { useWindow } from "#/components/hud/use-window"

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
  const throwingState = useState<number | null>(null),
    throwing = throwingState[0],
    setThrowing = throwingState[1]
  if (!win.open) return null
  const bag = player?.bag ?? Array.from({ length: BAG_SIZE }, () => null)
  const thrown = throwing === null ? null : bag[throwing]

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
          <ItemTooltip key={index} item={stack?.item} mark={stack} side="left">
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
              onDoubleClick={() => stack && game.useSlot(index, stack)}
              onContextMenu={(e) => {
                e.preventDefault()
                if (stack && trade) {
                  if (!trade.mine.locked && !trade.lots.some((l) => l.slot === index)) game.offerTrade([...trade.lots, { slot: index, count: stack.count }], trade.mine.gold)
                } else if (stack && storage) game.store(index, stack.count, stack)
                else if (stack && shop) window.dispatchEvent(new CustomEvent("ui:sell-pick", { detail: index }))
                else if (stack && ITEMS[stack.item].kind !== "key") setThrowing(index)
              }}
            />
          </ItemTooltip>
        ))}
      </div>
      {thrown && throwing !== null && (
        <div className="mt-1.5 flex items-center gap-2 font-body text-[12px]">
          <span className="min-w-0 flex-1 truncate">
            {displayName(thrown.item, thrown.by)} ×{thrown.count}
          </span>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              game.discard(throwing, thrown.count, thrown)
              setThrowing(null)
            }}
          >
            捨てる
          </Button>
          <Button size="sm" onClick={() => setThrowing(null)}>
            やめる
          </Button>
        </div>
      )}
    </Window>
  )
}
