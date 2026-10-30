import { dotVector3 } from "#/lib/engine/dot-vector3"
import type { ReadonlyMatrix3, Vector3, Vector3Tuple } from "#/lib/engine/vector3-types"

/** Project onto the frame's stored column axes without materializing a transposed matrix. */
export function multiplyTransposedMatrix3Vector(matrix: ReadonlyMatrix3, vector: Vector3): Vector3Tuple {
  return [dotVector3(matrix[0], vector), dotVector3(matrix[1], vector), dotVector3(matrix[2], vector)]
}
