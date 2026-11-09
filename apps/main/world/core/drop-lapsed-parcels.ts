import { ERRANDS } from "#/world/core/errands"
import { removeItem } from "#/world/core/remove-item"
import { countItem } from "#/world/core/count-item"
import type { Bag } from "#/world/core/bag-types"
import type { Taken } from "#/world/core/errand-types"

/**
 * A letter carried for an errand that is no longer open (another day's, or already handed over) goes back to its sender:
 * the bag keeps only the letters still being carried today.
 */
export function dropLapsedParcels(bag: Bag, open: readonly Taken[]): Bag {
  const carried = new Set(open.filter((taken) => !taken.done).map((taken) => taken.id))
  const held = { bag: bag }
  for (const errand of ERRANDS) {
    if (errand.kind !== "deliver" || !errand.carry || carried.has(errand.id)) continue
    const count = countItem(held.bag, errand.carry)
    const still = ERRANDS.filter((other) => other.kind === "deliver" && other.carry === errand.carry && carried.has(other.id)).length
    if (count > still) held.bag = removeItem({ bag: held.bag, item: errand.carry, count: count - still }) ?? held.bag
  }
  return held.bag
}
