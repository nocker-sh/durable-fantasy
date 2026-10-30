import { subtractVector3 } from "#/lib/engine/subtract-vector3"
import { scaleVector3 } from "#/lib/engine/scale-vector3"
import { dotVector3 } from "#/lib/engine/dot-vector3"
import type { Vector3 } from "#/lib/engine/vector3-types"
type Props = Readonly<{ root: Vector3; pole: Vector3; axis: Vector3 }>

/** Choose the same deterministic perpendicular when the pole lies on the target axis. */
export function getTwoBoneBend(props: Props) {
  const direction = subtractVector3(subtractVector3(props.pole, props.root), scaleVector3(props.axis, dotVector3(subtractVector3(props.pole, props.root), props.axis)))
  const magnitude = Math.hypot(...direction)
  if (magnitude < 1e-12) {
    const basis: Vector3 = Math.abs(props.axis[0]) < 0.8 ? [1, 0, 0] : [0, 1, 0]
    const fallback = subtractVector3(basis, scaleVector3(props.axis, dotVector3(basis, props.axis)))
    return { direction: fallback, magnitude: Math.hypot(...fallback) }
  }
  return { direction, magnitude }
}
