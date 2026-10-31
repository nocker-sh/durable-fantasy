import { expect, it } from "vitest"
import { ScalarField } from "#/lib/engine/scalar-field"
import { getStraightEntryApproachSurfacePlan } from "#/scripts/lib/get-straight-entry-approach-surface-plan"
import { getEntryApproachSurfaceHeight } from "#/scripts/lib/get-entry-approach-surface-height"
import { getEntryApproachEarthworks } from "#/scripts/lib/get-entry-approach-earthworks"

type Case = Readonly<{ points: readonly (readonly [number, number])[] }>
const cases = [
  {
    points: [
      [4, 4],
      [4, 10],
    ],
  },
  {
    points: [
      [4, 10],
      [4, 4],
    ],
  },
  {
    points: [
      [4, 4],
      [10, 4],
    ],
  },
  {
    points: [
      [10, 4],
      [4, 4],
    ],
  },
] satisfies readonly Case[]
const terrain = new ScalarField({ samples: Float32Array.from({ length: 16 ** 2 }, (_, index) => (index % 16) / 8 + Math.floor(index / 16) / 16), size: 16 })

it.each(cases)("joins the whole road width from a level lower landing: $points", (input) => {
  const surface = getStraightEntryApproachSurfacePlan({ points: input.points, widthM: 1, elevationM: 3, metresPerTile: 1 })
  if (surface instanceof Error) throw surface

  for (const offset of [-0.5, 0, 0.5]) {
    const landing: [number, number] = [...input.points[0]]
    const road: [number, number] = [...input.points[1]]
    landing[1 - surface.alongAxis] += offset
    road[1 - surface.alongAxis] += offset
    expect(getEntryApproachSurfaceHeight({ surface, terrain, point: landing })).toBe(3)
    expect(getEntryApproachSurfaceHeight({ surface, terrain, point: road })).toBe(terrain.sample(road[0], road[1]))
    const halfway: [number, number] = [...road]
    halfway[surface.alongAxis] = (surface.start + surface.end) / 2
    expect(getEntryApproachSurfaceHeight({ surface, terrain, point: halfway })).toBeCloseTo((3 + terrain.sample(road[0], road[1])) / 2)
    landing[surface.alongAxis] -= surface.direction * 0.25
    expect(getEntryApproachSurfaceHeight({ surface, terrain, point: landing })).toBe(3)
    road[surface.alongAxis] += surface.direction * 0.25
    expect(getEntryApproachSurfaceHeight({ surface, terrain, point: road })).toBe(terrain.sample(road[0], road[1]))
  }
})

it("measures interior cut and fill across the corridor without changing terrain", () => {
  const samples = new Float32Array(16 ** 2)
  samples[7 * 16 + 4] = 2
  const field = new ScalarField({ samples, size: 16 })
  const before = samples.slice()
  const surface = getStraightEntryApproachSurfacePlan({
    points: [
      [4, 4],
      [4, 10],
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

it.each([
  { points: [] },
  {
    points: [
      [4, 4],
      [4, 4],
    ],
  },
  {
    points: [
      [4, 4],
      [6, 8],
    ],
  },
  {
    points: [
      [4, 4],
      [4, 8],
      [6, 8],
    ],
  },
  {
    points: [
      [NaN, 4],
      [4, 8],
    ],
  },
] satisfies readonly Case[])("rejects malformed straight paths: $points", (input) => {
  expect(getStraightEntryApproachSurfacePlan({ points: input.points, widthM: 1, elevationM: 0, metresPerTile: 1 })).toBeInstanceOf(Error)
})

it("converts corridor width and terrain height to the same metric scale", () => {
  const field = new ScalarField({ samples: new Float32Array(16 ** 2).fill(0.5), size: 16 })
  const surface = getStraightEntryApproachSurfacePlan({
    points: [
      [4, 4],
      [4, 10],
    ],
    widthM: 2,
    elevationM: 3,
    metresPerTile: 2,
  })
  if (surface instanceof Error) throw surface

  expect(surface.blendBounds[2] - surface.blendBounds[0]).toBe(1)
  expect(getEntryApproachSurfaceHeight({ surface, terrain: field, point: [4, 7] })).toBe(2)
  expect(getEntryApproachSurfaceHeight({ surface, terrain: field, point: [4, 10] })).toBe(1)
})

it.each([
  { widthM: 0, elevationM: 0, metresPerTile: 1 },
  { widthM: 1, elevationM: NaN, metresPerTile: 1 },
  { widthM: 1, elevationM: 0, metresPerTile: 0 },
  { widthM: Infinity, elevationM: 0, metresPerTile: 1 },
  { widthM: Number.MIN_VALUE, elevationM: 0, metresPerTile: Number.MAX_VALUE },
])("rejects invalid or collapsed metric dimensions: %j", (dimensions) => {
  expect(
    getStraightEntryApproachSurfacePlan({
      points: [
        [4, 4],
        [4, 10],
      ],
      ...dimensions,
    }),
  ).toBeInstanceOf(Error)
})
