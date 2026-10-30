import { rectangleFace } from "#/lib/engine/rectangle-face"
import type { RectangleSide } from "#/lib/engine/rectangle-face"
import type { Rectangle } from "#/lib/engine/rectangle-subtraction"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { HearthSpec } from "#/world/town/hearth-types"
export type CookingTopSpec = Readonly<{ thickness: number; frontDepth: number; minimumBearing: number }>
type Props = { bounds: Rectangle; front: RectangleSide; hearth: HearthSpec; top: CookingTopSpec; bottom: number }

/** Replace the firebox roof with a plate bearing on both side walls; do not heat a vessel through an invented solid masonry lid. */
export function getCookingTopBox(props: Props): Cuboid | Error {
  const top = props.top,
    hearth = props.hearth,
    bounds = props.bounds
  if (
    ![...Object.values(bounds), ...Object.values(hearth), top.thickness, top.frontDepth, top.minimumBearing, props.bottom].every(Number.isFinite) ||
    Math.min(top.thickness, top.frontDepth, top.minimumBearing) <= 0 ||
    top.frontDepth >= hearth.chamberDepth ||
    bounds.x0 >= bounds.x1 ||
    bounds.z0 >= bounds.z1 ||
    !["n", "s", "w", "e"].includes(props.front) ||
    hearth.openingWidth <= 0 ||
    hearth.height <= top.thickness
  )
    return new Error("Invalid cooking plate dimensions")
  if (Math.abs(hearth.height - top.thickness - hearth.openingTop) > 1e-9) return new Error("Cooking plate does not directly roof its firebox")
  const face = rectangleFace({ x: (bounds.x0 + bounds.x1) / 2, z: (bounds.z0 + bounds.z1) / 2, width: bounds.x1 - bounds.x0, depth: bounds.z1 - bounds.z0, side: props.front })
  if (face.span / 2 - Math.abs(hearth.openingOffset) - hearth.openingWidth / 2 < top.minimumBearing) return new Error("Cooking plate lacks bearing on its side walls")
  const normal = face.outward,
    inward = top.frontDepth
  const a = [face.point[0] + (normal[1] * face.span) / 2, face.point[1] - (normal[0] * face.span) / 2],
    b = [face.point[0] - (normal[1] * face.span) / 2 - normal[0] * inward, face.point[1] + (normal[0] * face.span) / 2 - normal[1] * inward]

  return { x0: Math.min(a[0], b[0]), x1: Math.max(a[0], b[0]), z0: Math.min(a[1], b[1]), z1: Math.max(a[1], b[1]), bottom: props.bottom + hearth.openingTop, top: props.bottom + hearth.height }
}
