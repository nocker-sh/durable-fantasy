import type { Vector3 as V3, Vector3Tuple } from "./vector3-types"
export const crossVector3 = (a: V3, b: V3): Vector3Tuple => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
