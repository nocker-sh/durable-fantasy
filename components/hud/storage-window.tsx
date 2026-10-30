// The town warehouse (core/storage/rules.ts): what you have left with Hilde. Right-click a lot to take it
// back; right-click a bag slot (or drag it here) to leave it, for a small charge on each lot.
import { useEffect, useMemo, useState } from "react"
import { STORAGE_SIZE, STORE_FEE } from "#/world/core/storage/rules"
import { ITEMS } from "#/world/core/items/catalog"
import { displayName } from "#/world/core/display-name"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { apply } from "#/world/core/apply"
import { REASON_TEXT } from "#/world/core/commands"
import { Button } from "#/components/game/button"
import { Stepper } from "#/components/game/stepper"
import { Gold } from "#/components/game/gold"
import { Slot } from "#/components/game/slot"
import { Window } from "#/components/game/window"
import { ItemTooltip } from "./item-tooltip"
import { carriesItem } from "#/components/hud/carries-item"
import { readDrag } from "#/components/hud/read-drag"

export function StorageWindow() {
  const game = useGame()
  const open = useGameState((s) => s.storage)
  const player = useGameState((s) => s.player)
  const busy = useGameState((s) => s.busy)
  const overState = useState(false),
    over = overState[0],
    setOver = overState[1]
  const pickedState = useState<number | null>(null),
    picked = pickedState[0],
    setPicked = pickedState[1]
  const countState = useState(1),
    count = countState[0],
    setCount = countState[1]
  useEffect(() => {
    if (!open) setPicked(null)
  }, [open])
  const selected = picked === null ? null : player?.storage[picked]
  const amount = Math.min(count, selected?.count ?? 1)
  const preview = useMemo(
    () => (open && player && selected && picked !== null ? apply(player, { type: "retrieve", index: picked, count: amount, expectedStack: selected }, { now: Date.now() }) : null),
    [open, player, selected, picked, amount],
  )
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
            game.store(drag.slot, drag.stack.count, drag.stack)
          }
        }}
      >
        {lots.map((lot, index) => (
          <ItemTooltip key={index} item={lot?.item} mark={lot} side="left" hint={lot && "クリックで個数を選ぶ・右クリックで全部引き取る"}>
            <Slot
              icon={lot ? game.iconUrl(lot.item, lot.by) : null}
              rarity={lot ? ITEMS[lot.item].rarity : undefined}
              count={lot?.count}
              over={picked === index}
              onClick={() => {
                setPicked(lot ? index : null)
                setCount(1)
              }}
              aria-label={lot ? `${displayName(lot.item, lot.by)} ×${lot.count}` : "空き"}
              onContextMenu={(e) => {
                e.preventDefault()
                if (lot && !busy) game.retrieve(index, lot.count)
              }}
              onDoubleClick={() => lot && !busy && game.retrieve(index, lot.count)}
            />
          </ItemTooltip>
        ))}
      </div>
      <div className="mt-2 flex min-h-9 items-center gap-2.5 font-body text-[13px]">
        {selected ? (
          <>
            <span className="min-w-0 flex-1 truncate">{displayName(selected.item, selected.by)}</span>
            <Stepper value={amount} max={selected.count} onChange={setCount} />
            <Button variant="primary" size="sm" disabled={busy || !preview?.ok} onClick={() => picked !== null && game.retrieve(picked, amount)}>
              引き取る
            </Button>
          </>
        ) : (
          <span className="text-text-dim">品物を選ぶと、個数を決めて引き取れます。</span>
        )}
      </div>
      {preview && !preview.ok && (
        <p role="status" className="mt-1 font-body text-xs text-text-dim">
          {REASON_TEXT[preview.reason]}
        </p>
      )}
    </Window>
  )
}
