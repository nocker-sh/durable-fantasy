import type { Vector3 } from "../../engine/vector3-types"

export type CapsuleRayCoefficients = Readonly<{ startOffset: Vector3; axisLengthSquared: number; axisDirection: number; axisOrigin: number; quadratic: number; linear: number; constant: number }>
