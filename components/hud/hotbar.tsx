// Bottom (ui.md §3.13): ten round shortcuts on the number keys, the round menu buttons down the
// right edge, and the experience bar along the bottom. Drag items here from the bag, or skills
// from the skills window; right-click a shortcut to clear it.
import { useState, type DragEvent, type MouseEvent } from "react"
import { countItem } from "#/world/core/bag.ts"
import type { ItemId } from "#/world/core/items.ts"
import { REASON_TEXT } from "#/world/core/commands.ts"
import { SKILLS, artBlocked, skillKey, skillOfKey, type SkillId } from "#/world/core/skills.ts"
import type { WindowId } from "#/world/game.ts"
import { useGame, useGameState } from "#/components/game/context.tsx"
import { type LucideIcon, Map, Settings, ShoppingBag, SquareStar, Shirt, Users } from "lucide-react"
import { expToNext } from "#/world/core/growth.ts"
import { Kbd } from "#/components/game/kbd.tsx"
import { Slot } from "#/components/game/slot.tsx"
import { Tooltip, TooltipContent, TooltipTrigger } from "#/components/game/tooltip.tsx"
import { ItemTooltip } from "./item-tooltip.tsx"
import { iconUrl, uiIconUrl } from "#/world/art/icons.ts"
import type { SpriteName } from "#/world/art/pixel-art.ts"
import { carriesItem, readDrag } from "./drag.ts"

/** How a skill looks on the bar: a picture of its own, or the thing it is done with. */
const SKILL_ICON: Record<SkillId, { ui: SpriteName } | { item: ItemId }> = {
  sit: { ui: "full" },
  "first-aid": { item: "herb" },
  chop: { item: "wood-axe" },
  fell: { item: "log" },
  lunge: { item: "short-sword" },
  pierce: { item: "dagger" },
  ember: { item: "small-crystal" },
  kodama: { item: "oak-staff" },
}
export const skillIconUrl = (id: SkillId) => {
  const i = SKILL_ICON[id]
  return "ui" in i ? uiIconUrl(i.ui, 32) : iconUrl(i.item)
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]

/** The round buttons down the right edge (ui.md §3.13): white line icons on dark glass. */
const MENU: { id: WindowId | "system"; label: string; icon: LucideIcon; keys: string }[] = [
  { id: "inventory", label: "持ち物", icon: ShoppingBag, keys: "I" },
  { id: "equipment", label: "装備", icon: Shirt, keys: "E" },
  { id: "skills", label: "スキル", icon: SquareStar, keys: "K" },
  { id: "worldmap", label: "地図", icon: Map, keys: "M" },
  { id: "friends", label: "糸をつないだ人", icon: Users, keys: "F" },
  { id: "system", label: "設定", icon: Settings, keys: "Esc" },
]

export function Hotbar() {
  const game = useGame()
  const player = useGameState((s) => s.player)
  const windows = useGameState((s) => s.windows)
  const [over, setOver] = useState<number | null>(null)

  const drop = (index: number) => (event: DragEvent) => {
    event.preventDefault()
    setOver(null)
    const drag = readDrag(event)
    if (drag) game.bindHotbar(index, "skill" in drag ? skillKey(drag.skill) : drag.item)
  }

  const need = player ? expToNext(player.level) : 0
  return (
    <>
      <div className="pointer-events-auto absolute bottom-4 left-1/2 flex -translate-x-1/2 items-end gap-2">
        {KEYS.map((key, index) => {
          const entry = player?.hotbar[index] ?? null
          const skill = entry ? skillOfKey(entry) : null
          const drop_ = {
            over: over === index,
            onDragOver: (e: DragEvent) => {
              if (!carriesItem(e)) return
              e.preventDefault()
              setOver(index)
            },
            onDragLeave: () => setOver(null),
            onDrop: drop(index),
            onClick: () => game.useHotbar(index),
            onContextMenu: (e: MouseEvent) => {
              e.preventDefault()
              if (entry) game.bindHotbar(index, null)
            },
          }
          if (skill) {
            // a skill: dim while the weapon in hand or what has been raised does not allow it
            const blocked = player ? artBlocked(skill, player) : null
            return (
              <Tooltip key={key}>
                <TooltipTrigger render={<Slot round icon={skillIconUrl(skill)} dim={!!blocked} keyHint={key} aria-label={`ショートカット ${key}: ${SKILLS[skill].name}`} {...drop_} />} />
                <TooltipContent className="font-head text-xs">
                  {SKILLS[skill].name}
                  {blocked ? `（${REASON_TEXT[blocked]}）` : ""} ・ 右クリックで外す
                </TooltipContent>
              </Tooltip>
            )
          }
          const item = entry as ItemId | null
          const count = item && player ? countItem(player.bag, item) : 0
          return (
            <ItemTooltip key={key} item={item} hint="クリックか数字キーで使う · 右クリックで外す">
              <Slot round icon={item ? game.iconUrl(item) : null} count={item ? count : undefined} dim={!!item && count === 0} keyHint={key} aria-label={`ショートカット ${key}`} {...drop_} />
            </ItemTooltip>
          )
        })}
      </div>
      <div className="pointer-events-auto absolute top-[264px] right-3 flex flex-col gap-2.5">
        {MENU.map((m) => (
          <MenuButton
            key={m.id}
            label={m.label}
            keys={m.keys}
            icon={m.icon}
            active={m.id !== "system" && windows.includes(m.id)}
            onClick={() => (m.id === "system" ? game.openModal("system") : game.toggleWindow(m.id))}
          />
        ))}
      </div>
      {/* experience: a thin bar the width of the screen along the bottom edge */}
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-black/40" aria-label="経験値">
        <div className="h-full bg-[var(--color-exp)] transition-[width] duration-300" style={{ width: `${need ? Math.min(100, (100 * (player?.exp ?? 0)) / need) : 100}%` }} />
      </div>
    </>
  )
}

function MenuButton({ label, keys, icon: Icon, active, onClick }: { label: string; keys: string; icon: LucideIcon; active: boolean; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={onClick}
            className={`ui-round flex size-10 cursor-pointer items-center justify-center ${active ? "bg-[rgb(60_70_100/0.8)]" : ""}`}
          />
        }
      >
        <Icon size={20} color="#ffffff" strokeWidth={1.6} />
      </TooltipTrigger>
      <TooltipContent side="left" className="flex items-center gap-1.5 font-head">
        {label} <Kbd>{keys}</Kbd>
      </TooltipContent>
    </Tooltip>
  )
}
