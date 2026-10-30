import type { Vector3, Vector3Tuple } from "#/lib/engine/vector3-types"
export const subtractVector3 = (first: Vector3, second: Vector3): Vector3Tuple => [first[0] - second[0], first[1] - second[1], first[2] - second[2]]
