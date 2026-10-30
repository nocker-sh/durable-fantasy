import { subtractRectangles } from "./rectangle-subtraction"
import { gableRoofHeight } from "./gable-roof-height"
import { getGableRoofHalves } from "./get-gable-roof-halves"
import type { Rectangle } from "./rectangle-subtraction"
import type { GableRoof, RoofPanel, RoofPoint } from "./gable-roof-types"

/** Upward quads, split at the ridge and around vertical penetrations. */
export function gableRoofPanels(roof: GableRoof, cuts: readonly Rectangle[]) {
  const point = (x: number, z: number): RoofPoint => [x, gableRoofHeight(roof, x, z), z]
  return getGableRoofHalves(roof).flatMap((half, index) =>
    subtractRectangles(half, cuts).map((bounds): RoofPanel => {
      if (roof.ridgeAxis === "x") {
        if (index) return [point(bounds.x0, bounds.z1), point(bounds.x1, bounds.z1), point(bounds.x1, bounds.z0), point(bounds.x0, bounds.z0)]
        return [point(bounds.x1, bounds.z0), point(bounds.x0, bounds.z0), point(bounds.x0, bounds.z1), point(bounds.x1, bounds.z1)]
      }
      if (index) return [point(bounds.x1, bounds.z1), point(bounds.x1, bounds.z0), point(bounds.x0, bounds.z0), point(bounds.x0, bounds.z1)]
      return [point(bounds.x0, bounds.z0), point(bounds.x0, bounds.z1), point(bounds.x1, bounds.z1), point(bounds.x1, bounds.z0)]
    }),
  )
}
