import { putStack } from "#/world/core/put-stack"
import { takeFromSlot } from "#/world/core/take-from-slot"
import { sameStack } from "#/world/core/same-stack"
import type { ServerCommand } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
import { ITEMS } from "#/world/core/items/catalog"
import { STORAGE_KEEPER, STORE_FEE } from "#/world/core/storage/rules"
import { dealtWith } from "#/world/core/commerce-friendship"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"

/** 共通の回復と行動不能の判定後に呼び、選択した品が変わっていれば料金も親しさも更新しない。 */
export function store(state: PlayerState, command: Extract<ServerCommand, { type: "store" }>, now: number): Transition {
  const slot = state.bag[command.slot]
  if (!sameStack(slot, command.expectedStack)) return reject("ITEM_CHANGED")
  if (!slot) return reject("EMPTY_SLOT")
  if (ITEMS[slot.item].kind === "key") return reject("NOT_STORABLE")
  if (state.gold < STORE_FEE) return reject("NO_GOLD")
  const bag = takeFromSlot(state.bag, command.slot, command.count)
  if (!bag) return reject("NOT_ENOUGH")
  const storage = putStack(state.storage, { ...slot, count: command.count })
  if (!storage) return reject("STORAGE_FULL")
  // Hilde gets to know whose shelf it is, once a day
  const relationship = dealtWith(state, [STORAGE_KEEPER], now)
  return accept(
    { ...state, bag, storage, gold: state.gold - STORE_FEE, friends: relationship.friends, boughtOn: relationship.boughtOn },
    { type: "stored", item: slot.item, count: command.count, fee: STORE_FEE, ...(slot.by ? { by: slot.by } : {}) },
  )
}
