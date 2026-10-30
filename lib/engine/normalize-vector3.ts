import type { Vector3, Vector3Tuple } from "#/lib/engine/vector3-types"

/** A zero vector stays zero instead of inventing a direction. */
export function normalizeVector3(vector: Vector3): Vector3Tuple {
  const length = Math.hypot(vector[0], vector[1], vector[2]) || 1
  return [vector[0] / length, vector[1] / length, vector[2] / length]
}
