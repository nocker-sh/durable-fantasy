import type { Vector3Tuple as V3 } from "../../../lib/engine/vector3-types"
export type Footwear = Record<"l" | "r", { a: V3; b: V3; r: number }>
/** Lowest points of the rendered shoe capsules; contact alone does not prove balance or load support. */
export function groundFootwear(shoes: Footwear) {
  const feet = (["l", "r"] as const).map((side) => {
    const shoe = shoes[side],
      end = shoe.a[1] <= shoe.b[1] ? shoe.a : shoe.b
    return { side, lowest: [end[0], end[1] - shoe.r, end[2]] as V3 }
  })
  const rootY = -Math.min(...feet.map((f) => f.lowest[1]))
  return { rootY, feet: feet.map((f) => ({ ...f, lowest: [f.lowest[0], f.lowest[1] + rootY, f.lowest[2]] as V3, clearance: f.lowest[1] + rootY })) }
}
