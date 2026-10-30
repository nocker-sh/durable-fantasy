// What is worn (ui.md §3.8): seven slots around the figure. Drag from the bag onto a slot to wear
// it, double-click a slot (or drag it back to the bag) to take it off.
import { useState, type DragEvent } from "react"
import { ITEMS } from "#/world/core/items/catalog"
import { SLOTS, SLOT_NAME } from "#/world/core/items/kinds"
import { slotsFor } from "#/world/core/items/slots-for"
import type { Slot as SlotId } from "#/world/core/items/kinds"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Slot } from "#/components/game/slot"
import { Window } from "#/components/game/window"
import { uiIconUrl } from "#/world/art/ui-icon-url"
import type { SpriteName } from "#/world/art/pixel-art"
import { equipmentAttack } from "#/world/core/equipment-attack"
import { equipmentDefense } from "#/world/core/equipment-defense"
import { displayName } from "#/world/core/display-name"
import { ItemTooltip } from "./item-tooltip"
import { carriesItem } from "#/components/hud/carries-item"
import { readDrag } from "#/components/hud/read-drag"
import { startDrag } from "#/components/hud/start-drag"
import { useWindow } from "./use-window"

const LEFT: SlotId[] = ["head", "neck", "body", "feet"]
const RIGHT: SlotId[] = ["weapon", "shield"]
const BOTTOM: SlotId[] = ["accessory1", "accessory2"]

/** the silhouette an empty slot shows */
const EMPTY: Record<SlotId, SpriteName> = { neck: "chat", head: "helm", body: "tunic", weapon: "sword", shield: "shield", feet: "boots", accessory1: "ring", accessory2: "ring" }

export function EquipmentWindow() {
  const win = useWindow("equipment")
  const player = useGameState((s) => s.player)
  const derived = useGameState((s) => s.derived)
  const portrait = useGameState((s) => s.portrait)
  if (!win.open || !player || !derived) return null
  const gearAtk = player.equipment.weapon ? equipmentAttack(player.equipment.weapon, player.worn.weapon?.q) : 0
  const gearDef = SLOTS.reduce((n, slot) => {
    const item = player.equipment[slot]
    return n + (item ? equipmentDefense(item, player.worn[slot]?.q) : 0)
  }, 0)
  return (
    <Window
      id="equipment"
      title="装備"
      hotkey="E"
      key={win.key}
      {...win.props}
      initial={(w) => ({ x: w - 352 - 262, y: 104 })}
      footer={
        <dl className="grid grid-cols-2 gap-x-4 font-head text-xs">
          <div className="flex justify-between">
            <dt className="text-text-dim">攻撃力</dt>
            <dd>
              {derived.atk} <span className="text-text-dim">(+{gearAtk})</span>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-dim">防御</dt>
            <dd>
              {derived.def} <span className="text-text-dim">(+{gearDef})</span>
            </dd>
          </div>
        </dl>
      }
    >
      <div className="flex items-stretch gap-3">
        <div className="flex flex-col gap-1.5">
          {LEFT.map((s) => (
            <Worn key={s} slot={s} />
          ))}
        </div>
        <div className="ui-well relative flex w-[104px] items-end justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#2a3050,#0b0c15)]">
          {portrait && <img src={portrait} alt="" className="mb-2 h-[136px] max-w-none" />}
        </div>
        <div className="flex flex-col gap-1.5">
          {RIGHT.map((s) => (
            <Worn key={s} slot={s} />
          ))}
        </div>
      </div>
      <div className="mt-1.5 flex justify-center gap-1.5">
        {BOTTOM.map((s) => (
          <Worn key={s} slot={s} />
        ))}
      </div>
    </Window>
  )
}

function Worn(inputProps: { slot: SlotId }) {
  const slot = inputProps.slot

  const game = useGame()
  const item = useGameState((s) => s.player?.equipment[slot] ?? null)
  const mark = useGameState((s) => s.player?.worn[slot])
  const overState = useState(false),
    over = overState[0],
    setOver = overState[1]
  const drop = (event: DragEvent) => {
    event.preventDefault()
    setOver(false)
    const drag = readDrag(event)
    if (drag && "slot" in drag && slotsFor(drag.item).includes(slot)) game.equip(drag.slot, slot, drag.stack)
  }
  return (
    <ItemTooltip item={item} mark={mark} side="left" hint="ダブルクリックで外す">
      <Slot
        icon={item ? game.iconUrl(item, mark?.by) : null}
        rarity={item ? ITEMS[item].rarity : undefined}
        emptyIcon={uiIconUrl(EMPTY[slot], 32, true)}
        over={over}
        draggable={!!item}
        aria-label={`${SLOT_NAME[slot]}: ${item ? displayName(item, mark?.by) : "なし"}`}
        title={item ? undefined : SLOT_NAME[slot]}
        onDoubleClick={() => item && game.unequip(slot)}
        onDragStart={(e) => item && startDrag(e, { item, worn: slot, stack: { item, count: 1, ...mark } }, game.iconUrl(item, mark?.by))}
        onDragOver={(e) => {
          if (!carriesItem(e)) return
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={drop}
      />
    </ItemTooltip>
  )
}
