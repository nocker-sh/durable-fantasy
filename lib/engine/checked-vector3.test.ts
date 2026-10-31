import { expect, it } from "vitest"
import { checkedVector3 } from "#/lib/engine/checked-vector3"
import type { Vector3 } from "#/lib/engine/vector3-types"

it("preserves a valid vector without changing or coercing its components", () => {
  const vector: Vector3 = [1, -2, 3]
  expect(checkedVector3(vector, "invalid")).toBe(vector)
  expect(vector).toEqual([1, -2, 3])
})
const invalid = [[], [1, 2], [1, 2, 3, 4], [1, "2", 3], [undefined, 2, 3], [NaN, 0, 0], [Infinity, 0, 0], null]
it.each(invalid.map((value) => ({ value })))("rejects malformed coordinates with caller context: %j", (input) => {
  const request = { point: [1, 2, 3] satisfies Vector3 }
  Object.assign(request, { point: input.value })
  expect(() => checkedVector3(request.point, "point belongs to room")).toThrow("point belongs to room")
})
