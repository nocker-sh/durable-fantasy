// Equipment transitions (game-system.md §4.3), after the dispatcher's common guards.
import { putStack, takeFromSlot, type Stack } from "./bag.ts"
import type { GameEvent } from "./commands.ts"
import { ITEMS, slotsFor, type Slot } from "./items.ts"
import type { PlayerState, Worn } from "./player.ts"
import { derive, unmet } from "./stats.ts"
import { accept, reject, type Transition } from "./transition.ts"

/** What a stack carries besides the item: its quality, maker and wear. */
const wornOf = (s: Stack): Worn => ({ ...(s.q !== undefined ? { q: s.q } : {}), ...(s.by ? { by: s.by } : {}), ...(s.dur !== undefined ? { dur: s.dur } : {}) })
const without = (worn: PlayerState["worn"], slot: Slot): PlayerState["worn"] => {
  const { [slot]: _, ...rest } = worn
  return rest
}

export function equip(state: PlayerState, index: number, to?: Slot): Transition {
  const stack = state.bag[index]
  if (!stack) return reject("EMPTY_SLOT")
  const e = ITEMS[stack.item].equip
  const slots = slotsFor(stack.item)
  if (!e || !slots.length || (to && !slots.includes(to))) return reject("NOT_EQUIPPABLE")
  // the needs: stats as raised, and life skill levels (game-system.md §4.3)
  const short = unmet(e.needs, state)
  if (short.length) return reject(short.some(([k]) => k in state.stats) ? "STAT_TOO_LOW" : "SKILL_TOO_LOW")
  const slot = to ?? slots.find((s) => !state.equipment[s]) ?? slots[0]
  const weapon = state.equipment.weapon
  if (slot === "shield" && weapon && ITEMS[weapon].equip?.twoHanded) return reject("TWO_HANDED")

  let bag = takeFromSlot(state.bag, index, 1)!
  const equipment = { ...state.equipment, [slot]: stack.item }
  let worn = { ...state.worn, [slot]: wornOf(stack) }
  const off: Slot[] = []
  if (state.equipment[slot]) off.push(slot)
  // a two-handed weapon takes the shield hand too
  if (slot === "weapon" && e.twoHanded && state.equipment.shield) {
    off.push("shield")
    equipment.shield = null
  }
  for (const s of off) {
    const next = putStack(bag, { item: state.equipment[s]!, count: 1, ...state.worn[s] })
    if (!next) return reject("BAG_FULL")
    bag = next
    if (s !== slot) worn = without(worn, s)
  }
  return settleStats({ ...state, bag, equipment, worn }, ...off.map((s): GameEvent => ({ type: "unequipped", item: state.equipment[s]!, slot: s })), { type: "equipped", item: stack.item, slot })
}

/** Keep HP and SP within the maximums after equipment changes them. */
export function settleStats(state: PlayerState, ...events: GameEvent[]): Transition {
  const d = derive(state)
  return accept({ ...state, hp: Math.min(state.hp, d.maxHp), sp: Math.min(state.sp, d.maxSp) }, ...events)
}

export function unequip(state: PlayerState, slot: Slot): Transition {
  const item = state.equipment[slot]
  if (!item) return reject("NOTHING_EQUIPPED")
  const bag = putStack(state.bag, { item, count: 1, ...state.worn[slot] })
  if (!bag) return reject("BAG_FULL")
  return settleStats({ ...state, bag, equipment: { ...state.equipment, [slot]: null }, worn: without(state.worn, slot) }, { type: "unequipped", item, slot })
}
