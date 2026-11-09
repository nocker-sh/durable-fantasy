import type { Bag } from "#/world/core/bag-types"
import { BAG_SIZE } from "#/world/core/bag-rules"

export function emptyBag(size = BAG_SIZE): Bag {
  return Array.from({ length: size }, () => null)
}
