import { subtractVector3 } from "../../engine/subtract-vector3"
import { dotVector3 } from "../../engine/dot-vector3"
import type { Vector3 } from "../../engine/vector3-types"
import type { PrimitiveShape } from "./primitive-types"
import type { CapsuleRayCoefficients } from "./capsule-ray-types"

export function getCapsuleRayCoefficients(origin: Vector3, direction: Vector3, primitive: PrimitiveShape): CapsuleRayCoefficients {
  const axis = subtractVector3(primitive.b, primitive.a)
  const offset = subtractVector3(origin, primitive.a)
  const axisLengthSquared = dotVector3(axis, axis)
  const axisDirection = dotVector3(axis, direction)
  const axisOrigin = dotVector3(axis, offset)
  const rayOrigin = dotVector3(direction, offset)
  const originSquared = dotVector3(offset, offset)
  return {
    startOffset: offset,
    axisLengthSquared,
    axisDirection,
    axisOrigin,
    quadratic: axisLengthSquared - axisDirection * axisDirection,
    linear: axisLengthSquared * rayOrigin - axisOrigin * axisDirection,
    constant: axisLengthSquared * originSquared - axisOrigin * axisOrigin - primitive.r * primitive.r * axisLengthSquared,
  }
}
