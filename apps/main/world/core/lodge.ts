import { accept } from "#/world/core/accept"
import { derive } from "#/world/core/derive"
import { LODGING } from "#/world/core/lodging"
import { MAX_STAMINA } from "#/world/core/player-rules"
import { reject } from "#/world/core/reject"
import type { PlayerState } from "#/world/core/player-types"
import type { ShopId } from "#/world/core/shop-types"
import type { Transition } from "#/world/core/transition"

/** A rest in a bed at the inn the room has checked we stand at: stamina, HP and SP all come back, for the price of the stay. */
export function lodge(state: PlayerState, shop: ShopId): Transition {
  const cost = LODGING[shop]
  if (cost === undefined) return reject("NOT_SOLD_HERE")
  const derived = derive(state)
  if (state.stamina >= MAX_STAMINA && state.hp >= derived.maxHp && state.sp >= derived.maxSp) return reject("NOTHING_TO_GAIN")
  if (state.gold < cost) return reject("NO_GOLD")
  return accept({ ...state, gold: state.gold - cost, stamina: MAX_STAMINA, hp: derived.maxHp, sp: derived.maxSp }, { type: "lodged", shop, cost })
}
