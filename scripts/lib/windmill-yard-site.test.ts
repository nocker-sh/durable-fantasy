import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { getWindmillYardSiteReview } from "#/scripts/lib/get-windmill-yard-site-review"
import { getWindmillFieldReservations } from "#/scripts/lib/get-windmill-field-reservations"
import { getWindmillYardSiteErrors } from "#/scripts/lib/get-windmill-yard-site-errors"
import { getWindmillFieldPartition } from "#/scripts/lib/get-windmill-field-partition"
import { getWindmillYardSiteGeometry } from "#/scripts/lib/get-windmill-yard-site-geometry"
import { windmillYardSiteSchema } from "#/scripts/lib/windmill-yard-site-schema"
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import { TILE_M } from "#/world/town/fit"
const fixture = () => {
  const document = readSetting(readFileSync(".docs/settings/facilities/facility-square-windmill.md", "utf8"))
  const review = getWindmillYardSiteReview({ document, fields: SQUARE_LAYOUT.fields, roads: SQUARE_LAYOUT.roads, metresPerTile: TILE_M })
  if (!review || review instanceof Error) throw new Error("Missing mill site review")
  return { document, review }
}
it("accounts for every retained field piece and the removed area without modifying the source field or document", () => {
  const props = fixture(),
    before = JSON.stringify([props.document, SQUARE_LAYOUT.fields])
  const review = getWindmillYardSiteReview({ document: props.document, fields: SQUARE_LAYOUT.fields, roads: SQUARE_LAYOUT.roads, metresPerTile: TILE_M })
  if (!review || review instanceof Error) throw new Error("Missing site review")
  expect(review.partition.removedM2).toBeGreaterThan(0)
  expect(review.partition.retainedM2).toBeGreaterThan(0)
  expect(review.partition.removedM2 + review.partition.retainedM2).toBeCloseTo(review.partition.originalM2, 10)
  const bounds = review.footprint.rect
  for (const piece of review.partition.retained) expect(piece.x0 < bounds[2] && piece.x1 > bounds[0] && piece.z0 < bounds[3] && piece.z1 > bounds[1]).toBe(false)
  expect(JSON.stringify([props.document, SQUARE_LAYOUT.fields])).toBe(before)
})
it("replaces only the named field and refuses double allocation or a changed source rectangle", () => {
  const props = fixture(),
    review = props.review
  const source = [
    { id: review.sourceFieldId, rect: review.fieldRect },
    { id: "field-neighbour", rect: [1, 1, 2, 2] satisfies readonly [number, number, number, number] },
  ]
  const before = JSON.stringify(source),
    retained = getWindmillFieldReservations({ review, reservations: source })
  if (retained instanceof Error) throw retained
  expect(retained.find((entry) => entry.id === "field-neighbour")).toBe(source[1])
  expect(getWindmillFieldReservations({ review, reservations: retained })).toEqual(new Error("Mill field was already partitioned or changed"))
  expect(getWindmillFieldReservations({ review, reservations: [{ id: review.sourceFieldId, rect: [0, 0, 1, 1] }] })).toBeInstanceOf(Error)
  expect(JSON.stringify(source)).toBe(before)
})
it("retains every other obstacle and the full widths of water and roads", () => {
  const review = fixture().review,
    bounds = review.footprint.rect
  const ground = { mapTiles: 48, obstacles: [{ id: review.footprint.id, rect: bounds }], corridors: [] }
  expect(getWindmillYardSiteErrors({ review, ground })).toEqual([])
  expect(getWindmillYardSiteErrors({ review, ground: { ...ground, obstacles: [...ground.obstacles, { id: "other-field", rect: bounds }] } })).toContain("Outdoor reservation overlaps other-field")
  const points = [
    [bounds[0] - 1, bounds[1] - 0.2],
    [bounds[2] + 1, bounds[1] - 0.2],
  ] satisfies [number, number][]
  for (const id of ["river", "road-1"]) expect(getWindmillYardSiteErrors({ review, ground: { ...ground, corridors: [{ id, points, halfWidth: 0.3 }] } })).toContain(`Outdoor reservation covers ${id}`)
  expect(getWindmillYardSiteErrors({ review: { ...review, footprint: { ...review.footprint, rect: [-1, 0, 1, 1] } }, ground })).toContain("Outdoor reservation leaves its map")
})
it("rejects a false field claim, loss of the whole field and invalid scale", () => {
  const field = { x0: 0, z0: 0, x1: 10, z1: 10 }
  expect(getWindmillFieldPartition({ field, bounds: [11, 0, 12, 1], metresPerTile: 1 })).toEqual(new Error("Mill yard does not replace its nominated field"))
  expect(getWindmillFieldPartition({ field, bounds: [-1, -1, 11, 11], metresPerTile: 1 })).toEqual(new Error("Mill yard consumes the whole nominated field"))
  expect(getWindmillFieldPartition({ field, bounds: [1, 1, 2, 2], metresPerTile: NaN })).toBeInstanceOf(Error)
  const props = fixture()
  const site = windmillYardSiteSchema.parse(props.document.windmill_yard_site)
  props.document.windmill_yard_site = { ...site, field_index: 1 }
  expect(getWindmillYardSiteReview({ document: props.document, fields: SQUARE_LAYOUT.fields, roads: SQUARE_LAYOUT.roads, metresPerTile: TILE_M })).toBeInstanceOf(Error)
  props.document.design_gate = "通過"
  expect(getWindmillYardSiteReview({ document: props.document, fields: SQUARE_LAYOUT.fields, roads: SQUARE_LAYOUT.roads, metresPerTile: TILE_M })).toEqual(new Error("Invalid proposed windmill site"))
})
it("uses the same grid metre scale and rotates the complete footprint", () => {
  const props = fixture(),
    grid = props.document.grid,
    site = windmillYardSiteSchema.parse(props.document.windmill_yard_site)
  if (!grid) throw new Error("Missing yard grid")
  const original = getWindmillYardSiteGeometry({ grid, site, metresPerTile: TILE_M })
  const rotated = getWindmillYardSiteGeometry({ grid, site: { ...site, rotation_quarters: 1 }, metresPerTile: TILE_M })
  if (original instanceof Error || rotated instanceof Error) throw new Error("Missing footprint")
  expect(original.bounds[2] - original.bounds[0]).toBeCloseTo((grid.rows[0].length * grid.cell_m) / TILE_M, 12)
  expect(rotated.bounds[2] - rotated.bounds[0]).toBeCloseTo(original.bounds[3] - original.bounds[1], 12)
  expect(rotated.bounds[3] - rotated.bounds[1]).toBeCloseTo(original.bounds[2] - original.bounds[0], 12)
  expect(getWindmillYardSiteGeometry({ grid, site, metresPerTile: 0 })).toBeInstanceOf(Error)
})
