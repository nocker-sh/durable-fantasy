import type { GableRoof } from "./gable-roof-types"
export function gableRoofHeight(roof: GableRoof, x: number, z: number) {
  const b = roof.bounds,
    alongX = roof.ridgeAxis === "x",
    span = alongX ? b.z1 - b.z0 : b.x1 - b.x0,
    position = alongX ? z - b.z0 : x - b.x0
  return roof.eave + ((roof.ridge - roof.eave) * Math.min(position, span - position)) / (span / 2)
}
