import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { windmillYardSiteSchema } from "#/scripts/lib/windmill-yard-site-schema"
import { getWindmillRoadApproach } from "#/scripts/lib/get-windmill-road-approach"
import { getWindmillYardSiteReview } from "#/scripts/lib/get-windmill-yard-site-review"
import { getWindmillYardSiteErrors } from "#/scripts/lib/get-windmill-yard-site-errors"
import { getWindmillFieldPartition } from "#/scripts/lib/get-windmill-field-partition"
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import { TILE_M } from "#/world/town/fit"
const fixture = () => {
  const document = readSetting(readFileSync(".docs/settings/facilities/facility-square-windmill.md", "utf8"))
  const grid = document.grid,
    site = windmillYardSiteSchema.parse(document.windmill_yard_site)
  if (!grid || !site.approach) throw new Error("Missing approach study")
  const review = getWindmillYardSiteReview({ document, fields: SQUARE_LAYOUT.fields, roads: SQUARE_LAYOUT.roads, metresPerTile: TILE_M })
  if (!review || review instanceof Error || !review.approach) throw new Error("Missing approach review")
  return { document, grid, site, review }
}
it("joins the complete south opening to the nominated existing road without copying the derived gate coordinates", () => {
  const study = fixture(),
    approach = study.review.approach
  if (!approach) throw new Error("Missing approach")
  expect(approach.points[0][1]).toBeCloseTo(study.review.footprint.rect[3], 12)
  expect(approach.points[0][0]).toBeCloseTo(study.site.origin_tiles[0] + (11 * study.grid.cell_m) / TILE_M, 12)
  expect(approach.points[2]).toEqual(SQUARE_LAYOUT.roads[8].pts.at(-1))
  expect(approach.points[1]).toEqual([approach.points[0][0], approach.points[2][1]])
  for (const bound of approach.bounds) expect(Math.min(bound[2] - bound[0], bound[3] - bound[1]) * TILE_M).toBeCloseTo(approach.widthM, 12)
})
it("subtracts the yard and full approach together without double-counting their overlap or changing source fields", () => {
  const study = fixture(),
    approach = study.review.approach
  if (!approach) throw new Error("Missing approach")
  const before = JSON.stringify([study.document, SQUARE_LAYOUT.fields])
  const yardOnly = getWindmillFieldPartition({ field: SQUARE_LAYOUT.fields[0], bounds: study.review.footprint.rect, metresPerTile: TILE_M })
  const repeated = getWindmillFieldPartition({ field: SQUARE_LAYOUT.fields[0], bounds: study.review.footprint.rect, additionalBounds: [...approach.bounds, ...approach.bounds], metresPerTile: TILE_M })
  if (yardOnly instanceof Error || repeated instanceof Error) throw new Error("Missing partition")
  expect(study.review.partition.removedM2).toBeGreaterThan(yardOnly.removedM2)
  expect(repeated.removedM2).toBeCloseTo(study.review.partition.removedM2, 10)
  expect(study.review.partition.originalM2).toBeCloseTo(study.review.partition.removedM2 + study.review.partition.retainedM2, 10)
  for (const rect of study.review.partition.retained) for (const cut of approach.bounds) expect(rect.x0 < cut[2] && rect.x1 > cut[0] && rect.z0 < cut[3] && rect.z1 > cut[1]).toBe(false)
  expect(JSON.stringify([study.document, SQUARE_LAYOUT.fields])).toBe(before)
})
it("refuses a stale road anchor, a non-door, insufficient or excessive width and an unsupported rotated approach", () => {
  const study = fixture(),
    approach = study.site.approach
  if (!approach) throw new Error("Missing approach")
  const base = { grid: study.grid, site: study.site, roads: SQUARE_LAYOUT.roads, metresPerTile: TILE_M }
  for (const plan of [
    { ...approach, road_end_tiles: [37.81, 10] },
    { ...approach, door: [9, 19] },
    { ...approach, width_m: 0.79 },
    { ...approach, width_m: 1.01 },
  ]) {
    const site = windmillYardSiteSchema.parse({ ...study.site, approach: plan })
    expect(getWindmillRoadApproach({ ...base, site })).toBeInstanceOf(Error)
  }
  expect(getWindmillRoadApproach({ ...base, site: { ...study.site, rotation_quarters: 1 } })).toBeInstanceOf(Error)
  expect(getWindmillRoadApproach({ ...base, roads: [] })).toBeInstanceOf(Error)
  expect(getWindmillRoadApproach({ ...base, metresPerTile: NaN })).toBeInstanceOf(Error)
  expect(getWindmillRoadApproach({ ...base, grid: { cell_m: 0.5, rows: [] } })).toBeInstanceOf(Error)
})
it("preserves adjacent land and full corridor widths, allowing the target road only on the final segment", () => {
  const review = fixture().review,
    approach = review.approach
  if (!approach) throw new Error("Missing approach")
  const ground = { mapTiles: 48, obstacles: [{ id: review.footprint.id, rect: review.footprint.rect }], corridors: [] }
  expect(getWindmillYardSiteErrors({ review, ground })).toEqual([])
  const first = approach.bounds[0],
    middle = (first[1] + first[3]) / 2
  const points = [
    [first[0] - 1, middle],
    [first[2] + 1, middle],
  ] satisfies [number, number][]
  expect(getWindmillYardSiteErrors({ review, ground: { ...ground, obstacles: [...ground.obstacles, { id: "adjacent-crop", rect: first }] } })).toContain(
    "Approach 1: Outdoor reservation overlaps adjacent-crop",
  )
  expect(getWindmillYardSiteErrors({ review, ground: { ...ground, corridors: [{ id: approach.roadId, points, halfWidth: 0.1 }] } })).toContain(
    `Approach 1: Outdoor reservation covers ${approach.roadId}`,
  )
  const final = approach.bounds[1],
    edge = [
      [final[0], final[3] + 0.1],
      [final[2], final[3] + 0.1],
    ] satisfies [number, number][]
  expect(getWindmillYardSiteErrors({ review, ground: { ...ground, corridors: [{ id: "river", points: edge, halfWidth: 0.2 }] } })).toContain("Approach 2: Outdoor reservation covers river")
})
it("refuses a source field consumed by extra reservations and malformed field cuts", () => {
  const props = { field: { x0: 0, z0: 0, x1: 10, z1: 10 }, bounds: [0, 0, 2, 2] satisfies readonly [number, number, number, number], metresPerTile: 1 }
  expect(getWindmillFieldPartition({ ...props, additionalBounds: [[0, 0, 10, 10]] })).toEqual(new Error("Mill yard consumes the whole nominated field"))
  expect(getWindmillFieldPartition({ ...props, additionalBounds: [[0, 0, NaN, 2]] })).toEqual(new Error("Invalid mill field cuts"))
})
