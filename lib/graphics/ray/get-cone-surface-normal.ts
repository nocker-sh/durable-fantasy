import { subtractVector3 } from "#/lib/engine/subtract-vector3"
import { dotVector3 } from "#/lib/engine/dot-vector3"
import { normalizeVector3 } from "#/lib/engine/normalize-vector3"
import { addVector3 } from "#/lib/engine/add-vector3"
import { scaleVector3 } from "#/lib/engine/scale-vector3"
import { getConeFrame } from "#/lib/graphics/ray/get-cone-frame"
import type { Vector3, Vector3Tuple } from "#/lib/engine/vector3-types"
import type { ConeEndpoints } from "#/lib/graphics/ray/cone-frame-types"
type Props = ConeEndpoints & Readonly<{ r: number; r2: number }>

export function getConeSurfaceNormal(point: Vector3, primitive: Props): Vector3Tuple {
  const frame = getConeFrame(primitive)
  const offset = subtractVector3(point, primitive.a)
  const height = dotVector3(offset, frame.w)
  if (height > frame.h - 1e-3) return [...frame.w]

  const x = dotVector3(offset, frame.u)
  const y = dotVector3(offset, frame.v)
  const slope = (primitive.r2 - primitive.r) / frame.h
  const radius = Math.hypot(x, y) || 1
  const normal = normalizeVector3([x / radius, y / radius, -slope])
  return normalizeVector3(addVector3(addVector3(scaleVector3(frame.u, normal[0]), scaleVector3(frame.v, normal[1])), scaleVector3(frame.w, normal[2])))
}
