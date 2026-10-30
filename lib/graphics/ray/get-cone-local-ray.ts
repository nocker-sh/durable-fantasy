import { getConeFrame } from "./get-cone-frame"
import { subtractVector3 } from "../../engine/subtract-vector3"
import { dotVector3 } from "../../engine/dot-vector3"
import type { Vector3 } from "../../engine/vector3-types"
import type { PrimitiveShape } from "./primitive-types"
import type { ConeLocalRay } from "./cone-ray-types"

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
