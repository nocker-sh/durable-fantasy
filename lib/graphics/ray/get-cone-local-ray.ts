import { getConeFrame } from "#/lib/graphics/ray/get-cone-frame"
import { subtractVector3 } from "#/lib/engine/subtract-vector3"
import { dotVector3 } from "#/lib/engine/dot-vector3"
import type { Vector3 } from "#/lib/engine/vector3-types"
import type { PrimitiveShape } from "#/lib/graphics/ray/primitive-types"
import type { ConeLocalRay } from "#/lib/graphics/ray/cone-ray-types"

export function getConeLocalRay(origin: Vector3, direction: Vector3, primitive: PrimitiveShape): ConeLocalRay {
  const frame = getConeFrame(primitive)
  const relative = subtractVector3(origin, primitive.a)
  return {
    originX: dotVector3(relative, frame.u),
    originY: dotVector3(relative, frame.v),
    originZ: dotVector3(relative, frame.w),
    directionX: dotVector3(direction, frame.u),
    directionY: dotVector3(direction, frame.v),
    directionZ: dotVector3(direction, frame.w),
    height: frame.h,
    radius: primitive.r,
    endRadius: primitive.r2,
    slope: (primitive.r2 - primitive.r) / frame.h,
  }
}
