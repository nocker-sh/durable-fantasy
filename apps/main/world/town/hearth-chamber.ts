import { rectangleFace } from "#/lib/engine/rectangle-face"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { HearthChamberInput } from "#/world/town/hearth-types"
/** The open firebox uses the same dimensions as the masonry and its flue connection. */
export function hearthChamber(props: HearthChamberInput): Cuboid {
  const spec = props.spec
  const face = rectangleFace({
      x: (props.bounds.x0 + props.bounds.x1) / 2,
      z: (props.bounds.z0 + props.bounds.z1) / 2,
      width: props.bounds.x1 - props.bounds.x0,
      depth: props.bounds.z1 - props.bounds.z0,
      side: props.front,
    }),
    outward = face.outward
  const depth = outward[0] ? props.bounds.x1 - props.bounds.x0 : props.bounds.z1 - props.bounds.z0
  if (
    !Object.values(spec).every(Number.isFinite) ||
    spec.height <= 0 ||
    spec.openingBottom <= 0 ||
    spec.openingTop <= spec.openingBottom ||
    spec.openingTop >= spec.height ||
    spec.openingWidth <= 0 ||
    Math.abs(spec.openingOffset) + spec.openingWidth / 2 >= face.span / 2 ||
    spec.chamberDepth <= 0 ||
    spec.chamberDepth >= depth
  )
    throw new Error("Invalid hearth chamber dimensions")
  const p = (u: number, d: number) => [face.point[0] - outward[1] * u - outward[0] * d, face.point[1] + outward[0] * u - outward[1] * d]
  const a = p(spec.openingOffset - spec.openingWidth / 2, 0),
    b = p(spec.openingOffset + spec.openingWidth / 2, spec.chamberDepth)
  const chamber: Cuboid = {
    x0: Math.min(a[0], b[0]),
    z0: Math.min(a[1], b[1]),
    x1: Math.max(a[0], b[0]),
    z1: Math.max(a[1], b[1]),
    bottom: props.bottom + spec.openingBottom,
    top: props.bottom + spec.openingTop,
  }
  return chamber
}
