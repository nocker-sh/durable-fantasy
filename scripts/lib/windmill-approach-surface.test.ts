import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { ScalarField } from "#/lib/engine/scalar-field"
import { readSetting } from "#/scripts/lib/read-setting"
import { getWindmillYardSiteReview } from "#/scripts/lib/get-windmill-yard-site-review"
import { getWindmillApproachSection } from "#/scripts/lib/get-windmill-approach-section"
import { getWindmillApproachSurface } from "#/scripts/lib/get-windmill-approach-surface"
import { getWindmillApproachSurfaceHeight } from "#/scripts/lib/get-windmill-approach-surface-height"
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import { TILE_M } from "#/world/town/fit"
const fixture = () => {
  const document = readSetting(readFileSync(".docs/settings/facilities/facility-square-windmill.md", "utf8"))
  const review = getWindmillYardSiteReview({ document, fields: SQUARE_LAYOUT.fields, roads: SQUARE_LAYOUT.roads, metresPerTile: TILE_M })
  if (!review || review instanceof Error || !review.approach) throw new Error("Missing windmill approach")
  const samples = new Float32Array(10000).fill(0.25),
    terrain = new ScalarField({ samples, size: 100 })
  for (const x of [37, 38]) {
    samples[900 + x] = 0.22
    samples[1100 + x] = 0.28
  }
  const section = getWindmillApproachSection({ review, terrain, metresPerTile: TILE_M })
  if (!section || section instanceof Error || !section.surface) throw section ?? new Error("Missing surface")
  return { document, review, terrain, samples, surface: section.surface }
}
it("matches the full road cross-section and level turn, including their overlap and the unchanged road-side cap", () => {
  const source = fixture()
  const surface = source.surface
  const before = JSON.stringify([source.document, source.review, [...source.samples]])
  for (const index of Array.from({ length: 1001 }, (_, index) => index)) {
    const z = surface.blend_bounds[1] + ((surface.blend_bounds[3] - surface.blend_bounds[1]) * index) / 1000
    expect(getWindmillApproachSurfaceHeight({ ...source, point: [surface.road_x, z] })).toBe(source.terrain.sample(surface.road_x, z) * TILE_M)
    expect(getWindmillApproachSurfaceHeight({ ...source, point: [surface.start_x, z] })).toBe(surface.elevation_m)
    expect(getWindmillApproachSurfaceHeight({ ...source, point: [surface.blend_bounds[0], z] })).toBe(source.terrain.sample(surface.blend_bounds[0], z) * TILE_M)
    const x = (surface.start_x + surface.blend_bounds[2]) / 2
    expect(getWindmillApproachSurfaceHeight({ ...source, point: [x, z] })).toBe(surface.elevation_m)
  }
  expect(surface.start_x).toBe(source.review.approach?.bounds[0][0])
  expect(JSON.stringify([source.document, source.review, [...source.samples]])).toBe(before)
  expect(source.document.design_gate).toBe("未通過")
})
it("blends the transverse profile continuously and measures the shorter length beyond the whole turn", () => {
  const source = fixture()
  const surface = source.surface
  const z = surface.blend_bounds[1]
  const height = getWindmillApproachSurfaceHeight({ ...source, point: [(surface.start_x + surface.road_x) / 2, z] })
  expect(height).toBeCloseTo((surface.elevation_m + source.terrain.sample(surface.road_x, z) * TILE_M) / 2, 12)
  expect(surface.blend_length_m).toBeCloseTo(7.8, 12)
  expect(surface.maximum_longitudinal_grade).toBeGreaterThan(0)
  expect(surface.maximum_longitudinal_grade).toBeLessThanOrEqual(0.05)
})
it("rejects a steep edge even if the centre line fits, and refuses queries outside the reserved corridors", () => {
  const source = fixture()
  const approach = source.review.approach
  if (!approach) throw new Error("Missing approach")
  expect(getWindmillApproachSurface({ approach, metresPerTile: TILE_M, roadMinimumM: 0, roadMaximumM: 0.35 })).toEqual(new Error("Windmill surface exceeds its reserved full-width longitudinal grade"))
  expect(getWindmillApproachSurfaceHeight({ ...source, point: [0, 0] })).toEqual(new Error("Windmill surface point leaves its reserved corridors"))
  expect(getWindmillApproachSurfaceHeight({ ...source, point: [NaN, 10] })).toEqual(new Error("Invalid windmill surface point"))
})
