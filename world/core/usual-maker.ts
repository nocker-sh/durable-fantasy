import { MAKERS } from "#/world/core/makers"
import type { ItemId } from "#/world/core/items/catalog"

/** The maker whose thing it usually is, for made things that come with no name attached. */
export function usualMaker(item: ItemId): string {
  for (const entry of Object.entries(MAKERS)) {
    if (entry[1][item]) return entry[0]
  }
  return "町の人"
}
