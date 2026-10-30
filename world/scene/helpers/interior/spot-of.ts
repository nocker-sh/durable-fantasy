const SHRINK = 0.78
import type { Furniture, Interior } from "#/world/town/interiors"
import type { Spot } from "#/world/scene/construction/furnishings"

export function spotOf(it: Interior, f: Furniture, y0: number): Spot {
  const gaps: [number, Spot["face"]][] = [
    [f.z - f.d / 2 - it.z0, 0],
    [f.x - f.w / 2 - it.x0, 1],
    [it.x1 - (f.x + f.w / 2), 3],
    [it.z1 - (f.z + f.d / 2), 2],
  ]
  const gapState = gaps.reduce((a, b) => (b[0] < a[0] ? b : a)),
    gap = gapState[0],
    near = gapState[1]
  const face = gap < 0.8 ? near : 0
  if (f.kind === "hearth" || f.kind === "stair") return { x: f.x, z: f.z, w: f.w, d: f.d, y: y0, face }
  const across = f.kind === "counter" ? 1 : SHRINK
  const side = face === 1 || face === 3
  const w = f.w * (side ? SHRINK : across),
    d = f.d * (side ? across : SHRINK)
  if (gap >= 0.8) return { x: f.x, z: f.z, w, d, y: y0, face }
  // keep the back against the wall
  const x = face === 1 ? f.x - f.w / 2 + w / 2 : face === 3 ? f.x + f.w / 2 - w / 2 : f.x
  const z = face === 0 ? f.z - f.d / 2 + d / 2 : face === 2 ? f.z + f.d / 2 - d / 2 : f.z
  return { x, z, w, d, y: y0, face }
}
