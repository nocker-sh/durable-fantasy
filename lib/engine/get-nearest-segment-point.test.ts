import { expect, it } from "vitest"
import { getNearestSegmentPoint } from "#/lib/engine/get-nearest-segment-point"
import type { Vector2Tuple } from "#/lib/engine/vector2-types"

it("projects onto an interior point and clamps both ends", () => {
  const segment: { from: Vector2Tuple; to: Vector2Tuple } = { from: [0, 0], to: [4, 0] }
  expect(getNearestSegmentPoint({ ...segment, point: [2, 3] })).toEqual([2, 0])
  expect(getNearestSegmentPoint({ ...segment, point: [-2, 3] })).toEqual([0, 0])
  expect(getNearestSegmentPoint({ ...segment, point: [8, 3] })).toEqual([4, 0])
})

it("handles repeated endpoints and leaves input coordinates unchanged", () => {
  const props = { from: [2, 3], to: [2, 3], point: [10, -4] } satisfies Parameters<typeof getNearestSegmentPoint>[0]
  const snapshot = structuredClone(props)
  expect(getNearestSegmentPoint(props)).toEqual([2, 3])
  expect(props).toEqual(snapshot)
})
