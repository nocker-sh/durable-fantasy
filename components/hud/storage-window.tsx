// The town warehouse (core/storage.ts): what you have left with Hilde. Right-click a lot to take it
// back; right-click a bag slot (or drag it here) to leave it, for a small charge on each lot.
import { useState } from "react"
import { STORAGE_SIZE, STORE_FEE } from "#/world/core/storage.ts"
import { ITEMS } from "#/world/core/items.ts"
import { displayName } from "#/world/core/makers.ts"
import { useGame, useGameState } from "#/components/game/context.tsx"
import { Gold } from "#/components/game/gold.tsx"
import { Slot } from "#/components/game/slot.tsx"
import { Window } from "#/components/game/window.tsx"
import { ItemTooltip } from "./item-tooltip.tsx"
import { carriesItem, readDrag } from "./drag.ts"

export function StorageWindow() {
  const game = useGame()
  const open = useGameState((s) => s.storage)
  const player = useGameState((s) => s.player)
  const [over, setOver] = useState(false)
  if (!open || !player) return null
  const lots = player.storage
  const used = lots.filter(Boolean).length
  return (
    <Window
      id="storage"
      title="町の倉庫"
      z={30}
      onClose={() => game.closeStorage()}
      initial={(w) => ({ x: Math.max(12, w - 352 - 560), y: 90 })}
      className="w-[548px]"
      footer={
        <div className="flex items-center justify-between font-head text-xs text-text-dim">
          <span>
            預かり賃 一つにつき <Gold amount={STORE_FEE} /> ・ 引き取りはただ
          </span>
          <span className="tabular-nums">
            {used} / {STORAGE_SIZE}
          </span>
        </div>
      }
    >
      <div
        className={`ui-scroll ui-well grid max-h-[420px] grid-cols-10 gap-1 overflow-y-auto p-1.5 ${over ? "shadow-[inset_0_0_0_1px_var(--color-brass-hi)]" : ""}`}
        onDragOver={(e) => {
          if (!carriesItem(e)) return
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          const drag = readDrag(e)
          if (drag && "slot" in drag) {
            const s = player.bag[drag.slot]
            if (s) game.store(drag.slot, s.count)
          }
        }}
      >
        {lots.map((lot, index) => (
          <ItemTooltip key={index} item={lot?.item} mark={lot} side="left" hint={lot && "右クリックで引き取る"}>
            <Slot
              icon={lot ? game.iconUrl(lot.item, lot.by) : null}
              rarity={lot ? ITEMS[lot.item].rarity : undefined}
              count={lot?.count}
              aria-label={lot ? `${displayName(lot.item, lot.by)} ×${lot.count}` : "空き"}
              onContextMenu={(e) => {
                e.preventDefault()
                if (lot) game.retrieve(index, lot.count)
              }}
              onDoubleClick={() => lot && game.retrieve(index, lot.count)}
            />
          </ItemTooltip>
        ))}
      </div>
    </Window>
  )
}
