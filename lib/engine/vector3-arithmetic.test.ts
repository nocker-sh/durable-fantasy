import { expect, it } from "vitest"
import { multiplyMatrix3Vector } from "./multiply-matrix3-vector"
import { multiplyTransposedMatrix3Vector } from "./multiply-transposed-matrix3-vector"
import { normalizeVector3 } from "./normalize-vector3"
import { addVector3 } from "./add-vector3"
import type { ReadonlyMatrix3, Vector3 } from "./vector3-types"

it("distinguishes stored frame columns from their transpose without assuming orthogonality", () => {
  const matrix: ReadonlyMatrix3 = [
    [1, 2, 0],
    [3, 4, 0],
    [0, 0, 2],
  ]
  const vector: Vector3 = [2, -1, 0.5]
  expect(multiplyMatrix3Vector(matrix, vector)).toEqual([-1, 0, 1])
  expect(multiplyTransposedMatrix3Vector(matrix, vector)).toEqual([0, 2, 1])
})
it("keeps readonly inputs intact and gives each caller its own result, including a zero direction", () => {
  const source: Vector3 = [3, 4, 0]
  const normalized = normalizeVector3(source)
  expect(normalized).toEqual([0.6, 0.8, 0])
  normalized[0] = 7
  const sum = addVector3(source, [1, 0, 0])
  sum[0] = 8
  expect(source).toEqual([3, 4, 0])
  expect(normalizeVector3(source)).toEqual([0.6, 0.8, 0])
  expect(normalizeVector3([0, 0, 0])).toEqual([0, 0, 0])
})
