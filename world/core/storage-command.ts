// Warehouse transitions after shared recovery and fallen-state guards.
import { putStack, takeFromSlot } from "./bag.ts"
import type { ServerCommand } from "./commands.ts"
import type { PlayerState } from "./player.ts"
import { ITEMS } from "./items.ts"
import { carried } from "./inventory-weight.ts"
import { STORAGE_KEEPER, STORE_FEE } from "./storage.ts"
import { dealtWith } from "./commerce-friendship.ts"
import { derive } from "./stats.ts"
import { accept, reject, type Transition } from "./transition.ts"

export function store(state: PlayerState, command: Extract<ServerCommand, { type: "store" }>, now: number): Transition {
  const slot = state.bag[command.slot]
  if (!slot) return reject("EMPTY_SLOT")
  if (ITEMS[slot.item].kind === "key") return reject("NOT_STORABLE")
  if (state.gold < STORE_FEE) return reject("NO_GOLD")
  const bag = takeFromSlot(state.bag, command.slot, command.count)
  if (!bag) return reject("NOT_ENOUGH")
  const storage = putStack(state.storage, { ...slot, count: command.count })
  if (!storage) return reject("STORAGE_FULL")
  // Hilde gets to know whose shelf it is, once a day
  const { friends, boughtOn } = dealtWith(state, [STORAGE_KEEPER], now)
  return accept(
    { ...state, bag, storage, gold: state.gold - STORE_FEE, friends, boughtOn },
    { type: "stored", item: slot.item, count: command.count, fee: STORE_FEE, ...(slot.by ? { by: slot.by } : {}) },
  )
}

export function retrieve(state: PlayerState, command: Extract<ServerCommand, { type: "retrieve" }>): Transition {
  const lot = state.storage[command.index]
  if (!lot) return reject("EMPTY_SLOT")
  const storage = takeFromSlot(state.storage, command.index, command.count)
  if (!storage) return reject("NOT_ENOUGH")
  if (carried(state) + ITEMS[lot.item].weight * command.count > derive(state).maxWeight) return reject("TOO_HEAVY")
  const bag = putStack(state.bag, { ...lot, count: command.count })
  if (!bag) return reject("BAG_FULL")
  return accept({ ...state, bag, storage }, { type: "retrieved", item: lot.item, count: command.count, ...(lot.by ? { by: lot.by } : {}) })
}
