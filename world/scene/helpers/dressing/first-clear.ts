import type { V2 } from "#/world/scene/construction/registry"
import type { HouseDef } from "#/world/town/house-types"
import { clear } from "#/world/scene/helpers/dressing/clear"

export function firstClear(h: HouseDef, spots: V2[], r: number): V2 | null {
  for (const p of spots) if (clear(h, p, r)) return p
  return null
}
