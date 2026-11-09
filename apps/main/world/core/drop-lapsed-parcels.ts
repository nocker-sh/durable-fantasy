import { ERRANDS } from "#/world/core/errands"
import { removeItem } from "#/world/core/remove-item"
import { countItem } from "#/world/core/count-item"
import type { Bag } from "#/world/core/bag-types"
import type { Taken } from "#/world/core/errand-types"

/**
 * A letter carried, or a lost thing found, for an errand that is no longer open (another day's, or already handed over) goes back to its sender:
 * the bag keeps only the letters still being carried today.
 */
export function dropLapsedParcels(bag: Bag, open: readonly Taken[]): Bag {
  const carried = new Set(open.filter((taken) => !taken.done).map((taken) => taken.id))
  const held = { bag: bag }
  // what an errand puts in the bag and nothing else does: a letter carried, or a lost thing found
  const errandItem = (errand: (typeof ERRANDS)[number]) => (errand.kind === "deliver" ? errand.carry : errand.find ? errand.wants.item : undefined)
  for (const errand of ERRANDS) {
    const item = errandItem(errand)
    if (!item || carried.has(errand.id)) continue
    const count = countItem(held.bag, item)
    const still = ERRANDS.filter((other) => errandItem(other) === item && carried.has(other.id)).length
    if (count > still) held.bag = removeItem({ bag: held.bag, item: item, count: count - still }) ?? held.bag
  }
  return held.bag
}
