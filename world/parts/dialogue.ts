// What a conversation with a resident holds: what they say this time, and what you can do with
// them (shop, commission, storage, errands). Game (game.ts) opens and turns the pages.
import { COMMISSIONS } from "../core/commissions.ts"
import { phase } from "../core/clock.ts"
import { dayOf, errandProgress, errandOf, errandToday, todays } from "../core/errands.ts"
import { ITEMS } from "../core/items.ts"
import { shopOfKeeper } from "../core/shops.ts"
import { STORAGE_KEEPER } from "../core/storage.ts"
import { shopOpen } from "../maps/index.ts"
import { eventOf } from "../town/events.ts"
import { pick, type Situation } from "../town/lines/line.ts"
import { ALL_LINES } from "../town/lines/index.ts"
import { slotAt } from "../town/routines.ts"
import { storageOpen } from "../town/warehouse.ts"
import type { DialogueChoice, GameState } from "../state.ts"

/** Is the resident minding their shop now (a seller off duty just talks). */
export const keepingShop = (name: string, min: number) => !!shopOfKeeper(name, (s) => shopOpen(s, min))

/** What a resident and we have to do with errands now: hear today's, or hand one over to them. */
export function errandChoices(state: GameState, name: string, now = Date.now()): DialogueChoice[] {
  const player = state.player
  if (!player) return []
  const mine = todays(player.errands, now)
  const out: DialogueChoice[] = []
  for (const t of mine) {
    const e = errandOf(t.id)
    if (!e || t.done || (e.kind === "bring" ? e.from : e.to) !== name) continue
    out.push({ label: e.kind === "bring" ? `${ITEMS[e.wants!.item].name}を渡す` : `${e.parcel}を渡す`, action: "errand-hand", errand: e.id })
  }
  const asked = errandToday(name, dayOf(now))
  if (asked && !mine.some((t) => t.id === asked.id)) out.push({ label: "頼まれごとを聞く", action: "errand-ask", errand: asked.id })
  return out
}

/** Everything you can do with a resident now, ending with goodbye. */
export function choicesFor(state: GameState, name: string): DialogueChoice[] {
  const min = state.clock.min
  const takesWork = COMMISSIONS.some((c) => c.craftsman === name) && keepingShop(name, min)
  return [
    ...(keepingShop(name, min) ? [{ label: "買い物をする", action: "shop" as const }] : []),
    ...(takesWork ? [{ label: "仕事を頼む", action: "commission" as const }] : []),
    ...(name === STORAGE_KEEPER && storageOpen(min) ? [{ label: "荷を預ける・引き取る", action: "storage" as const }] : []),
    ...errandChoices(state, name),
    { label: "さようなら", action: "close" as const },
  ]
}

/**
 * What a resident says this time (town/lines.ts): the lines that fit the hour, what they are
 * doing, who is nearby, what kind of day it is and whether we have spoken before (remembered
 * under `spokenKey`).
 */
export function linesFor(state: GameState, name: string, spokenKey: string, now = Date.now()): string[] {
  let spoken: string[] = []
  try {
    spoken = JSON.parse(localStorage.getItem(spokenKey) ?? "[]")
  } catch {
    spoken = []
  }
  const situation: Situation = {
    phase: phase(state.clock.min),
    doing: slotAt(name, state.clock.min)?.doing ?? "",
    nearby: new Set(state.npcs.map((n) => n.name).filter((n) => n !== name)),
    friend: state.player?.friends[name] ?? 0,
    event: eventOf(now),
    errands: state.player ? errandProgress(state.player, name, now) : {},
    firstTime: !spoken.includes(name),
  }
  if (situation.firstTime) localStorage.setItem(spokenKey, JSON.stringify([...spoken, name]))
  const pages = pick(ALL_LINES[name] ?? [], situation, 3, Math.floor(now / 60_000))
  return pages.length ? pages : ["……"]
}
