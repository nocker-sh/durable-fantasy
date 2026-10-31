import type { Bag, Stack } from "#/world/core/bag-types"
import { putStack } from "#/world/core/put-stack"

/** 提示された順に全品を収納し、一つでも入らなければ途中の袋を返さない。 */
export function putStacks(bag: Bag, stacks: readonly Stack[]): Bag | null {
  const incoming = { bag }
  for (const stack of stacks) {
    const next = putStack(incoming.bag, stack)
    if (!next) return null
    incoming.bag = next
  }

  return incoming.bag
}
