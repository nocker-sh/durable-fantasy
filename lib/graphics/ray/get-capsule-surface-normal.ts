import { subtractVector3 } from "../../engine/subtract-vector3"
import { dotVector3 } from "../../engine/dot-vector3"
import { normalizeVector3 } from "../../engine/normalize-vector3"
import { addVector3 } from "../../engine/add-vector3"
import { scaleVector3 } from "../../engine/scale-vector3"
import type { Vector3, Vector3Tuple } from "../../engine/vector3-types"
type Props = Readonly<{ a: Vector3; b: Vector3 }>

export function getCapsuleSurfaceNormal(point: Vector3, primitive: Props): Vector3Tuple {
  const axis = subtractVector3(primitive.b, primitive.a)
  const lengthSquared = dotVector3(axis, axis)
  if (lengthSquared === 0) return normalizeVector3(subtractVector3(point, primitive.a))

  const projection = Math.min(1, Math.max(0, dotVector3(subtractVector3(point, primitive.a), axis) / lengthSquared))
  return normalizeVector3(subtractVector3(point, addVector3(primitive.a, scaleVector3(axis, projection))))
}
