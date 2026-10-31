import type { Vector3 } from "#/lib/engine/vector3-types"

/** Reject malformed vectors before arithmetic; never coerce components or fill missing coordinates. */
export function checkedVector3(vector: Vector3, message: string): Vector3 {
  if (!Array.isArray(vector) || vector.length !== 3 || !Number.isFinite(vector[0]) || !Number.isFinite(vector[1]) || !Number.isFinite(vector[2])) throw new RangeError(message)
  return vector
}
