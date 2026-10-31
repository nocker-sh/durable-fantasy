import { expect, it } from "vitest"
import { SpatialFrame } from "#/lib/engine/spatial-frame"
import { projectEnvelopeDoorPoint } from "#/scripts/lib/project-envelope-door-point"

it.each([
  { rotation: 0, expected: [11, 22.5] },
  { rotation: 1, expected: [12.5, 29] },
  { rotation: 2, expected: [19, 23.5] },
  { rotation: 3, expected: [13.5, 21] },
])("converts cells and room-local metres once under rotation $rotation", (input) => {
  const frame = new SpatialFrame({ origin: [10, 7, 20], width: 10, depth: 6, quarterTurns: input.rotation })
  expect(projectEnvelopeDoorPoint({ frame, origin: [2, 4], cellM: 0.5, point: [1, 3], metresPerTile: 2 })).toEqual(input.expected)
})
it.each([0, -1, Infinity, NaN])("rejects an invalid outdoor scale %s", (metresPerTile) => {
  const frame = new SpatialFrame({ origin: [0, 0, 0], width: 10, depth: 6, quarterTurns: 0 })
  expect(() => projectEnvelopeDoorPoint({ frame, origin: [0, 0], cellM: 0.5, point: [1, 1], metresPerTile })).toThrow("Invalid door metre-to-tile scale")
})
