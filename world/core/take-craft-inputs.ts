import { takeFromSlot } from "#/world/core/take-from-slot"
import { qualityWeight } from "#/world/core/quality-weight"
import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import type { Bag } from "#/world/core/bag-types"

type Props = { bag: Bag; inputs: readonly { item: ItemId; count: number }[] }
type Materials = { bag: Bag; weight: number; made: number }

/** Consume lower-quality materials first; missing inputs never expose a partly consumed bag. */
export function takeCraftInputs(props: Props): Materials | null {
  const materials = props.inputs.flatMap((input) => Array.from({ length: Math.ceil(input.count) }, () => input.item))

  return materials.reduce<Materials | null>(
    (used, item) => {
      if (!used) return null
      const slot = used.bag.reduce((lowest, stack, index) => {
        if (stack?.item === item && (lowest < 0 || (stack.q ?? 1) < (used.bag[lowest]!.q ?? 1))) return index

        return lowest
      }, -1)
      if (slot < 0) return null

      const isMade = ITEMS[item].made
      return { bag: takeFromSlot(used.bag, slot, 1)!, weight: used.weight + (isMade ? qualityWeight(used.bag[slot]!.q) : 0), made: used.made + (isMade ? 1 : 0) }
    },
    { bag: props.bag, weight: 0, made: 0 },
  )
}
