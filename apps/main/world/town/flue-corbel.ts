import { subtractRectangles, type Rectangle } from "#/lib/engine/rectangle-subtraction"
import type { FlueSection } from "#/world/town/floorplan/types"

/** Stepped masonry transfers the collar back into the shaft rather than onto timber. */
export function flueCorbelParts(shaft: FlueSection, top: number, bounds: Rectangle) {
  const depthSource = shaft.floorSupport,
    depth = depthSource.depth,
    steps = depthSource.steps,
    c = shaft.floorCollar
  if (!Number.isFinite(depth) || depth <= 0 || !Number.isInteger(steps) || steps < 1 || !Number.isFinite(c) || c <= 0 || c > depth) throw new Error("Invalid flue corbel dimensions")
  const parts: (Rectangle & { bottom: number; top: number })[] = []
  for (let i = 0; i < steps; i++) {
    const overhang = (c * (i + 1)) / steps
    const outer = {
      x0: Math.max(bounds.x0, shaft.x0 - overhang),
      z0: Math.max(bounds.z0, shaft.z0 - overhang),
      x1: Math.min(bounds.x1, shaft.x1 + overhang),
      z1: Math.min(bounds.z1, shaft.z1 + overhang),
    }
    if (outer.x0 >= outer.x1 || outer.z0 >= outer.z1) continue
    for (const r of subtractRectangles(outer, [shaft])) parts.push({ ...r, bottom: top - depth + (depth * i) / steps, top: top - depth + (depth * (i + 1)) / steps })
  }
  return parts
}
