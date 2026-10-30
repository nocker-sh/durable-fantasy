import type { Group } from "three"
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import { getPastureFence } from "#/world/town/get-pasture-fence"
import { fence } from "#/world/scene/construction/fence"

/** Inspect the actual pasture perimeter and opening, translated without changing panel spacing or wear indices. */
export function buildPastureFence(root: Group, x: number, z: number): void {
  const width = SQUARE_LAYOUT.pasture.x1 - SQUARE_LAYOUT.pasture.x0,
    depth = SQUARE_LAYOUT.pasture.z1 - SQUARE_LAYOUT.pasture.z0
  const plan = getPastureFence({ x0: x - width / 2, x1: x + width / 2, z0: z - depth / 2, z1: z + depth / 2 })
  fence({ root: root, pts: plan.points, gaps: plan.gaps, h: plan.height })
}
