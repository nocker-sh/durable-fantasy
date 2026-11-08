import { rectangleFace } from "#/lib/engine/rectangle-face"
import type { RectangleSide } from "#/lib/engine/rectangle-face"
import { storedToolParts } from "#/world/town/stored-tool"
import type { WorkingToolDimensions, WorkingToolGeometry } from "#/world/town/working-tool"

/** Exact blade and handle boxes in the tool's orthonormal frame, with the grip at its origin. */
export function workingToolGeometry(front: RectangleSide, tilt: number, spec: WorkingToolDimensions): WorkingToolGeometry {
  if (
    !Object.values(spec).every((v) => Number.isFinite(v) && v > 0) ||
    !Number.isFinite(tilt) ||
    tilt < 0 ||
    tilt >= Math.PI / 2 ||
    spec.gripFromBlade <= spec.bladeLength ||
    spec.gripFromBlade >= spec.length
  )
    throw new Error("Invalid working tool dimensions")
  const outward = rectangleFace({ x: 0, z: 0, width: 1, depth: 1, side: front }).outward
  const s = Math.sin(tilt)
  const c = Math.cos(tilt)
  const axes: WorkingToolGeometry["axes"] = [
    [-outward[1], 0, outward[0]],
    [outward[0] * c, s, outward[1] * c],
    [-outward[0] * s, c, -outward[1] * s],
  ]
  const parts = storedToolParts(
    { part: "contents", x0: -spec.width / 2, x1: spec.width / 2, z0: -spec.thickness / 2, z1: spec.thickness / 2, y0: 0, y1: spec.length },
    { handleWidth: spec.handleWidth, bladeLength: spec.bladeLength },
  )
  return {
    axes,
    parts: parts.map((p, i) => ({ part: i === 0 ? "blade" : "handle", bounds: { x0: p.x0, x1: p.x1, z0: p.z0, z1: p.z1, bottom: p.y0 - spec.gripFromBlade, top: p.y1 - spec.gripFromBlade } })),
  }
}
