import { errandOf } from "#/world/core/errand-of"
import { errandToday } from "#/world/core/errand-today"
import { todays } from "#/world/core/todays"
import { dayOf } from "#/world/core/day-of"
import { ITEMS } from "#/world/core/items/catalog"
import type { DialogueChoice, GameState } from "#/world/state"

/** What a resident and we have to do with errands now: hear today's, or hand one over to them. */
export function errandChoices(state: GameState, name: string, now = Date.now()): DialogueChoice[] {
  const player = state.player
  if (!player) return []
  const mine = todays(player.errands, now)
  const out: DialogueChoice[] = []
  for (const t of mine) {
    const e = errandOf(t.id)
    if (!e || t.done || (e.kind === "bring" ? e.from : e.to) !== name) continue
    out.push({ label: e.kind === "bring" ? `${ITEMS[e.wants.item].name}を渡す` : `${e.parcel}を渡す`, action: "errand-hand", errand: e.id })
  }
  const asked = errandToday(name, dayOf(now))
  if (asked && !mine.some((t) => t.id === asked.id)) out.push({ label: "頼まれごとを聞く", action: "errand-ask", errand: asked.id })
  return out
}
