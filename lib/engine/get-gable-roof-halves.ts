import type { GableRoof } from "./gable-roof-types"
import type { Rectangle } from "./rectangle-subtraction"

/** Keep the eaves' overhang on both slopes and split exactly at the ridge. */
export function getGableRoofHalves(roof: GableRoof): readonly Rectangle[] {
  const bounds = roof.bounds
  const extended = { x0: bounds.x0 - roof.overhang, z0: bounds.z0 - roof.overhang, x1: bounds.x1 + roof.overhang, z1: bounds.z1 + roof.overhang }
  if (roof.ridgeAxis === "x") {
    const middle = (bounds.z0 + bounds.z1) / 2
    return [
      { ...extended, z1: middle },
      { ...extended, z0: middle },
    ]
  }
  const middle = (bounds.x0 + bounds.x1) / 2
  return [
    { ...extended, x1: middle },
    { ...extended, x0: middle },
  ]
}
