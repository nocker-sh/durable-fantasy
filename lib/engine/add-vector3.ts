import type { Vector3 as V3, Vector3Tuple } from "./vector3-types"
export const addVector3 = (a: V3, b: V3): Vector3Tuple => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
