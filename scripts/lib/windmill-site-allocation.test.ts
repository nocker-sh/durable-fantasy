import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { getWindmillYardSiteReviews } from "#/scripts/lib/get-windmill-yard-site-reviews"
import { getWindmillSiteReservations } from "#/scripts/lib/get-windmill-site-reservations"
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import { TILE_M } from "#/world/town/fit"
const fixture = () => {
  const document = readSetting(readFileSync(".docs/settings/facilities/facility-square-windmill.md", "utf8"))
  return { document, fieldsByMap: new Map([["map-phanthiet", SQUARE_LAYOUT.fields]]) }
}
it("collects a one-shot document iterator without modifying documents or source fields", () => {
  const source = fixture(),
    before = JSON.stringify([source.document, [...source.fieldsByMap]])
  const documents = new Map([[source.document.id, source.document]])
  const result = getWindmillYardSiteReviews({ documents: documents.values(), fieldsByMap: source.fieldsByMap, roadsByMap: new Map([["map-phanthiet", SQUARE_LAYOUT.roads]]), metresPerTile: TILE_M })
  expect(result.errors).toEqual([])
  expect(result.reviews).toHaveLength(1)
  expect(result.reviews[0].footprint.map).toBe("map-phanthiet")
  expect(JSON.stringify([source.document, [...source.fieldsByMap]])).toBe(before)
})
it("refuses an unknown map and does not borrow another map's fields", () => {
  const source = fixture()
  const missing = getWindmillYardSiteReviews({ documents: [source.document], fieldsByMap: new Map(), metresPerTile: TILE_M })
  expect(missing.errors).toEqual([`${source.document.id}: Windmill site has no outdoor map`])
  const wrongFields = getWindmillYardSiteReviews({
    documents: [source.document],
    fieldsByMap: new Map([
      ["map-phanthiet", []],
      ["map-other", SQUARE_LAYOUT.fields],
    ]),
    metresPerTile: TILE_M,
  })
  expect(wrongFields.errors).toEqual([`${source.document.id}: Windmill site has no nominated source field`])
  expect(wrongFields.reviews).toEqual([])
})
it("partitions a fresh reservation map and preserves unrelated land and the original map", () => {
  const source = fixture(),
    collection = getWindmillYardSiteReviews({ documents: [source.document], fieldsByMap: source.fieldsByMap, roadsByMap: new Map([["map-phanthiet", SQUARE_LAYOUT.roads]]), metresPerTile: TILE_M })
  const review = collection.reviews[0]
  if (!review) throw new Error("Missing site review")
  const field = [{ id: review.sourceFieldId, rect: review.fieldRect }]
  const other = [{ id: "other-field", rect: [0, 0, 1, 1] satisfies readonly [number, number, number, number] }]
  const reservations = new Map([
    [review.footprint.map, field],
    ["map-other", other],
  ])
  const before = JSON.stringify([...reservations]),
    result = getWindmillSiteReservations({ reviews: collection.reviews, reservations })
  expect(result.errors).toEqual([])
  expect(result.reservations).not.toBe(reservations)
  expect(result.reservations.get("map-other")).toBe(other)
  expect(result.reservations.get(review.footprint.map)?.some((land) => land.id === review.sourceFieldId)).toBe(false)
  expect(result.footprints.map((footprint) => footprint.id)).toEqual([review.footprint.id, `${review.footprint.id}/approach-1`, `${review.footprint.id}/approach-2`])
  expect(JSON.stringify([...reservations])).toBe(before)
})
it("keeps a rejected duplicate's footprint visible while refusing a second claim on the same field", () => {
  const source = fixture(),
    collection = getWindmillYardSiteReviews({ documents: [source.document], fieldsByMap: source.fieldsByMap, roadsByMap: new Map([["map-phanthiet", SQUARE_LAYOUT.roads]]), metresPerTile: TILE_M })
  const review = collection.reviews[0]
  if (!review) throw new Error("Missing site review")
  const second = { ...review, footprint: { ...review.footprint, id: "facility-second-mill" } }
  const result = getWindmillSiteReservations({ reviews: [review, second], reservations: new Map([[review.footprint.map, [{ id: review.sourceFieldId, rect: review.fieldRect }]]]) })
  expect(result.errors).toEqual(["facility-second-mill: Mill field was already partitioned or changed"])
  expect(result.footprints.map((footprint) => footprint.id)).toEqual([
    review.footprint.id,
    `${review.footprint.id}/approach-1`,
    `${review.footprint.id}/approach-2`,
    second.footprint.id,
    `${second.footprint.id}/approach-1`,
    `${second.footprint.id}/approach-2`,
  ])
  expect(result.reservations.get(review.footprint.map)?.every((land) => land.id.includes(review.footprint.id))).toBe(true)
})
it("reports stale land without overwriting it or hiding the proposed site", () => {
  const source = fixture(),
    collection = getWindmillYardSiteReviews({ documents: [source.document], fieldsByMap: source.fieldsByMap, roadsByMap: new Map([["map-phanthiet", SQUARE_LAYOUT.roads]]), metresPerTile: TILE_M })
  const review = collection.reviews[0]
  if (!review) throw new Error("Missing site review")
  const land = [{ id: review.sourceFieldId, rect: [0, 0, 1, 1] satisfies readonly [number, number, number, number] }]
  const result = getWindmillSiteReservations({ reviews: [review], reservations: new Map([[review.footprint.map, land]]) })
  expect(result.errors).toEqual([`${review.footprint.id}: Mill field was already partitioned or changed`])
  expect(result.reservations.get(review.footprint.map)).toBe(land)
  expect(result.footprints.map((footprint) => footprint.id)).toEqual([review.footprint.id, `${review.footprint.id}/approach-1`, `${review.footprint.id}/approach-2`])
})
