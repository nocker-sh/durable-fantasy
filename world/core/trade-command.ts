// Inventory halves of a trade, after the dispatcher's recovery and fallen-state guards.
import { putStack, takeFromSlot, type Bag, type Stack } from "./bag.ts"
import type { ServerCommand } from "./commands.ts"
import type { PlayerState } from "./player.ts"
import { ITEMS } from "./items.ts"
import { carried } from "./inventory-weight.ts"
import { derive } from "./stats.ts"
import { accept, reject, type Transition } from "./transition.ts"

export function tradeOut(state: PlayerState, command: Extract<ServerCommand, { type: "trade-out" }>): Transition {
  const { lots, gold } = command.offer
  if (!Number.isInteger(gold) || gold < 0 || gold > state.gold) return reject("NO_GOLD")
  if (new Set(lots.map((l) => l.slot)).size !== lots.length) return reject("NOT_ENOUGH")
  let bag: Bag = state.bag
  const stacks: Stack[] = []
  for (const { slot, count } of lots) {
    const s = state.bag[slot]
    if (!s) return reject("EMPTY_SLOT")
    if (ITEMS[s.item].kind === "key") return reject("NOT_TRADABLE")
    const next = takeFromSlot(bag, slot, count)
    if (!next) return reject("NOT_ENOUGH")
    bag = next
    stacks.push({ ...s, count })
  }
  return accept({ ...state, bag, gold: state.gold - gold }, { type: "traded-out", stacks, gold })
}

export function tradeIn(state: PlayerState, command: Extract<ServerCommand, { type: "trade-in" }>): Transition {
  let bag: Bag = state.bag
  for (const s of command.stacks) {
    const next = putStack(bag, s)
    if (!next) return reject("BAG_FULL")
    bag = next
  }
  const weight = carried({ bag, equipment: state.equipment })
  if (command.stacks.length && weight > derive(state).maxWeight) return reject("TOO_HEAVY")
  return accept({ ...state, bag, gold: state.gold + command.gold }, { type: "traded-in", stacks: [...command.stacks], gold: command.gold })
}
