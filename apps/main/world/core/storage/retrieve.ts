import { putStack } from "#/world/core/put-stack"
import { takeFromSlot } from "#/world/core/take-from-slot"
import { sameStack } from "#/world/core/same-stack"
import type { ServerCommand } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
import { ITEMS } from "#/world/core/items/catalog"
import { carried } from "#/world/core/inventory-weight"
import { derive } from "#/world/core/derive"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"

/** 共通の回復と行動不能の判定後に呼び、選択の一致と持てる重さを確かめてから移す。 */
export function retrieve(state: PlayerState, command: Extract<ServerCommand, { type: "retrieve" }>): Transition {
  const lot = state.storage[command.index]
  if (!sameStack(lot, command.expectedStack)) return reject("ITEM_CHANGED")
  if (!lot) return reject("EMPTY_SLOT")
  const storage = takeFromSlot(state.storage, command.index, command.count)
  if (!storage) return reject("NOT_ENOUGH")
  if (carried(state) + ITEMS[lot.item].weight * command.count > derive(state).maxWeight) return reject("TOO_HEAVY")
  const bag = putStack(state.bag, { ...lot, count: command.count })
  if (!bag) return reject("BAG_FULL")
  return accept({ ...state, bag, storage }, { type: "retrieved", item: lot.item, count: command.count, ...(lot.by ? { by: lot.by } : {}) })
}
