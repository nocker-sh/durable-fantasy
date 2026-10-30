import type { ReadonlyMatrix3, Vector3, Vector3Tuple } from "#/lib/engine/vector3-types"

/** The matrix stores columns, so each output component combines the corresponding row. */
export function multiplyMatrix3Vector(matrix: ReadonlyMatrix3, vector: Vector3): Vector3Tuple {
  return [
    matrix[0][0] * vector[0] + matrix[1][0] * vector[1] + matrix[2][0] * vector[2],
    matrix[0][1] * vector[0] + matrix[1][1] * vector[1] + matrix[2][1] * vector[2],
    matrix[0][2] * vector[0] + matrix[1][2] * vector[1] + matrix[2][2] * vector[2],
  ]
}
