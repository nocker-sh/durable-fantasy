import type { Vector3 as V3, Vector3Tuple } from "#/lib/engine/vector3-types"
export const scaleVector3 = (a: V3, k: number): Vector3Tuple => [a[0] * k, a[1] * k, a[2] * k]
