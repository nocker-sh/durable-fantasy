import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import { dotVector3 as dot } from "#/lib/engine/dot-vector3"
import { normalizeVector3 as norm } from "#/lib/engine/normalize-vector3"
import { scaleVector3 as mul } from "#/lib/engine/scale-vector3"
import { crossVector3 as cross } from "#/lib/engine/cross-vector3"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
type Props = { from: V3; to: V3; acrossHint: V3 }

/** Reject collapsed or parallel axes instead of inventing a new orientation for a deformed surface. */
export function getOrthogonalFrame(props: Props) {
  if (![...props.from, ...props.to, ...props.acrossHint].every(Number.isFinite)) return new Error("Invalid surface frame")
  const delta = sub(props.to, props.from),
    length = Math.hypot(...delta)
  if (!Number.isFinite(length) || length <= 1e-12) return new Error("Collapsed surface axis")
  const axis = norm(delta),
    projected = sub(props.acrossHint, mul(axis, dot(props.acrossHint, axis)))
  if (!Number.isFinite(Math.hypot(...projected)) || Math.hypot(...projected) <= 1e-12) return new Error("Parallel surface frame axes")
  const across = norm(projected)

  return { axis, across, up: cross(axis, across), length }
}
