// Errands and friendship (economy.md §6): what residents have asked of you today, and how well each
// of them knows you now.
import { countItem } from "#/world/core/count-item"
import { errandLabel } from "#/world/core/errand-label"
import { errandOf } from "#/world/core/errand-of"
import { todays } from "#/world/core/todays"
import { friendDiscount } from "#/world/core/friend-discount"
import { useGameState } from "#/hooks/use-game-state"
import { Window } from "#/components/game/window"
import { useWindow } from "./use-window"

export function ErrandsWindow() {
  const win = useWindow("errands")
  const player = useGameState((s) => s.player)
  if (!win.open || !player) return null
  const today = todays(player.errands, Date.now())
  const friends = Object.entries(player.friends)
    .filter((entry) => {
      const f = entry[1]
      return f > 0
    })
    .sort((a, b) => b[1] - a[1])
  return (
    <Window id="errands" title="頼まれごと" hotkey="J" {...win.props} key={win.key} initial={(w) => ({ x: Math.max(12, w - 620), y: 140 })} className="w-[300px]">
      <p className="mb-1 font-head text-xs text-brass-hi">今日引き受けたこと</p>
      <ul className="mb-3 flex flex-col gap-1">
        {today.map((t) => {
          const e = errandOf(t.id)
          if (!e) return null
          const progress = e.kind === "bring" ? `${Math.min(e.wants.count, countItem(player.bag, e.wants.item))}/${e.wants.count}` : "届ける"
          return (
            <li key={t.id} className={`ui-well flex items-center gap-2 px-2 py-1 font-body text-[13px] ${t.done ? "text-text-faint" : ""}`}>
              <span className="min-w-0 flex-1 truncate">{errandLabel(e)}</span>
              <span className="font-head text-[11px] text-text-dim">{t.done ? "済んだ" : progress}</span>
            </li>
          )
        })}
        {!today.length && <li className="font-body text-[12px] text-text-faint">住民に話しかけると、頼みごとをされることがある。頼まれごとはその日のうちに。</li>}
      </ul>
      <p className="mb-1 font-head text-xs text-brass-hi">親しい人</p>
      <ul className="ui-scroll flex max-h-48 flex-col gap-1 overflow-y-auto pr-1">
        {friends.map((entry2) => {
          const name = entry2[0]
          const f = entry2[1]
          return (
            <li key={name} className="flex items-center gap-2 font-body text-[12px]">
              <span className="w-24 truncate">{name}</span>
              <span className="ui-well relative h-2 flex-1 overflow-hidden">
                <span className="absolute inset-y-0 left-0 bg-good/70" style={{ width: `${f}%` }} />
              </span>
              <span className="w-16 text-right font-head text-[11px] text-text-dim">
                {f}
                {friendDiscount(f) > 0 ? ` ・${Math.round(friendDiscount(f) * 100)}%引` : ""}
              </span>
            </li>
          )
        })}
        {!friends.length && <li className="font-body text-[12px] text-text-faint">まだ顔なじみはいない。</li>}
      </ul>
    </Window>
  )
}
