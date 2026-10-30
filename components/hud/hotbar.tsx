// Bottom (ui.md §3.13): ten round shortcuts on the number keys, the round menu buttons down the
// right edge, and the experience bar along the bottom. Drag items here from the bag, or skills
// from the skills window; right-click a shortcut to clear it.
import { useState, type DragEvent, type MouseEvent } from "react"
import { countItem } from "#/world/core/count-item"
import { REASON_TEXT } from "#/world/core/commands"
import { SKILLS } from "#/world/core/skills"
import { artBlocked } from "#/world/core/art-blocked"
import { skillKey } from "#/world/core/skill-key"
import { skillOfKey } from "#/world/core/skill-of-key"
import type { WindowId } from "#/world/state"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { type LucideIcon, Map, Settings, ShoppingBag, SquareStar, Shirt, Users } from "lucide-react"
import { expToNext } from "#/world/core/exp-to-next"
import { Kbd } from "#/components/game/kbd"
import { Slot } from "#/components/game/slot"
import { Tooltip } from "#/components/game/tooltip"
import { TooltipContent } from "#/components/game/tooltip-content"
import { TooltipTrigger } from "#/components/game/tooltip-trigger"
import { ItemTooltip } from "#/components/hud/item-tooltip"
import type { ItemId } from "#/world/core/items/catalog"
import { carriesItem } from "#/components/hud/carries-item"
import { readDrag } from "#/components/hud/read-drag"

import { useDeadlineClock } from "#/hooks/use-deadline-clock"
import { skillIconUrl } from "#/components/hud/skill-icon"

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
  const overState = useState<number | null>(null),
    over = overState[0],
    setOver = overState[1]

  const drop = (index: number) => (event: DragEvent) => {
    event.preventDefault()
    setOver(null)
    const drag = readDrag(event)
    if (drag) game.bindHotbar(index, "skill" in drag ? skillKey(drag.skill) : drag.item)
  }

  const until =
    player?.hotbar.reduce((latest, entry) => {
      const id = entry && skillOfKey(entry)
      return id ? Math.max(latest, player.ready[id] ?? 0) : latest
    }, 0) ?? 0
  const now = useDeadlineClock(until)
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
            // Keep the shortcut removable while waiting; the controller also guards keyboard use.
            const blocked = player ? artBlocked(skill, player) : null
            const seconds = Math.max(0, Math.ceil(((player?.ready[skill] ?? 0) - now) / 1000))
            return (
              <Tooltip key={key}>
                <TooltipTrigger
                  render={
                    <Slot
                      round
                      icon={skillIconUrl(skill)}
                      dim={!!blocked || seconds > 0}
                      keyHint={key}
                      aria-label={`ショートカット ${key}: ${SKILLS[skill].name}${seconds ? `（あと${seconds}秒）` : ""}`}
                      {...drop_}
                    >
                      {seconds > 0 && <span className="pointer-events-none absolute bottom-1 font-tiny text-xs text-white ui-text-shadow">{seconds}</span>}
                    </Slot>
                  }
                />
                <TooltipContent className="font-head text-xs">
                  {SKILLS[skill].name}
                  {blocked ? `（${REASON_TEXT[blocked]}）` : seconds ? `（あと${seconds}秒）` : ""} ・ SP {SKILLS[skill].sp} ・ 右クリックで外す
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

function MenuButton(inputProps: { label: string; keys: string; icon: LucideIcon; active: boolean; onClick: () => void }) {
  const label = inputProps.label
  const keys = inputProps.keys
  const Icon = inputProps.icon
  const active = inputProps.active
  const onClick = inputProps.onClick

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
