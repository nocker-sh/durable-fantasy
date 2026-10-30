import type { Vector3 as V3 } from "#/lib/engine/vector3-types"
export const dotVector3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
