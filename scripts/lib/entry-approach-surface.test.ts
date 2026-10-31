import { expect, it } from "vitest"
import { ScalarField } from "#/lib/engine/scalar-field"
import { getEntryApproachSurfacePlan } from "#/scripts/lib/get-entry-approach-surface-plan"
import { getEntryApproachSurfaceHeight } from "#/scripts/lib/get-entry-approach-surface-height"
import { getEntryApproachEarthworks } from "#/scripts/lib/get-entry-approach-earthworks"

const terrain = new ScalarField({ samples: Float32Array.from({ length: 16 ** 2 }, (_, index) => (index % 16) / 8 + Math.floor(index / 16) / 16), size: 16 })

it.each([
  [
    [4, 4],
    [6, 4],
    [6, 10],
  ],
  [
    [4, 10],
    [6, 10],
    [6, 4],
  ],
  [
    [4, 4],
    [4, 6],
    [10, 6],
  ],
  [
    [10, 4],
    [10, 6],
    [4, 6],
  ],
] as const)("keeps both corridors level where they overlap and joins the complete road profile: %j", (first, turn, road) => {
  const surface = getEntryApproachSurfacePlan({ points: [first, turn, road], widthM: 1, elevationM: 3, metresPerTile: 1 })
  if (surface instanceof Error) throw surface
  expect(getEntryApproachSurfaceHeight({ surface, terrain, point: turn })).toBe(3)
  const overlap = [
    Math.max(surface.levelBounds[0], surface.blendBounds[0]),
    Math.max(surface.levelBounds[1], surface.blendBounds[1]),
    Math.min(surface.levelBounds[2], surface.blendBounds[2]),
    Math.min(surface.levelBounds[3], surface.blendBounds[3]),
  ]
  for (const x of [overlap[0], overlap[2]]) for (const z of [overlap[1], overlap[3]]) expect(getEntryApproachSurfaceHeight({ surface, terrain, point: [x, z] })).toBe(3)

  for (const offset of [-0.5, -0.17, 0, 0.13, 0.5]) {
    const point: [number, number] = [...road]
    point[1 - surface.alongAxis] += offset
    expect(getEntryApproachSurfaceHeight({ surface, terrain, point })).toBe(terrain.sample(point[0], point[1]))
  }
  const cap: [number, number] = [...road]
  cap[surface.alongAxis] += surface.direction * 0.25
  expect(getEntryApproachSurfaceHeight({ surface, terrain, point: cap })).toBe(terrain.sample(cap[0], cap[1]))
  const halfway: [number, number] = [...road]
  halfway[surface.alongAxis] = (surface.start + surface.end) / 2
  expect(getEntryApproachSurfaceHeight({ surface, terrain, point: halfway })).toBeCloseTo((3 + terrain.sample(road[0], road[1])) / 2)
})

it("measures an interior terrain peak and never rewrites its field", () => {
  const samples = new Float32Array(12 ** 2),
    field = new ScalarField({ samples, size: 12 })
  samples[4 * 12 + 5] = 2
  const before = samples.slice()
  const surface = getEntryApproachSurfacePlan({
    points: [
      [3, 4],
      [7, 4],
      [7, 9],
    ],
    widthM: 2,
    elevationM: 0,
    metresPerTile: 1,
  })
  if (surface instanceof Error) throw surface

  expect(getEntryApproachEarthworks({ surface, terrain: field })).toEqual({ cutM: 2, fillM: 0 })
  expect(samples).toEqual(before)
  expect(getEntryApproachSurfaceHeight({ surface, terrain: field, point: [0, 0] })).toBeInstanceOf(Error)
})

it("rejects diagonal legs, zero length and a blend shorter than the turn's width", () => {
  for (const points of [
    [
      [2, 2],
      [3, 3],
      [3, 8],
    ],
    [
      [2, 2],
      [2, 2],
      [2, 8],
    ],
    [
      [2, 2],
      [4, 2],
      [4, 2.2],
    ],
  ] as const) {
    expect(getEntryApproachSurfacePlan({ points, widthM: 1, elevationM: 0, metresPerTile: 1 })).toBeInstanceOf(Error)
  }
})
