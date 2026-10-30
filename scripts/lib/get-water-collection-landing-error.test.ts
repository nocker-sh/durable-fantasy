import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { potableWaterCollectionSchema } from "#/scripts/lib/potable-water-supply-schema"
import { getWaterCollectionLandingError } from "#/scripts/lib/get-water-collection-landing-error"
import { MAPS } from "#/world/maps/index"
import { VILLAGE } from "#/world/maps/layout"
import { TILE_M } from "#/world/town/fit"
const fixture = () => {
  const document = readSetting(readFileSync(new URL("../../.docs/settings/facilities/facility-square-well.md", import.meta.url), "utf8"))
  const collection = potableWaterCollectionSchema.parse(document.water_collection)
  if (!collection.landing) throw new Error("Missing receiving floor")
  document.water_collection = collection
  const resident = readSetting(readFileSync(new URL("../../.docs/settings/residents/resident-ゾフィー.md", import.meta.url), "utf8"))
  const documents = new Map([
    [document.id, document],
    [resident.id, resident],
  ])
  return { document, documents, landing: collection.landing, map: MAPS.phanthiet, anchorTiles: VILLAGE.plaza, metresPerTile: TILE_M }
}
it("fits the whole authored south receiving floor onto native free cells outside the unchanged well", () => {
  expect(getWaterCollectionLandingError(fixture())).toBeNull()
})
it("refuses a floor through the well and a northward floor through the current stalls", () => {
  const f = fixture()
  f.landing.origin_m = [-1.5, 0]
  expect(getWaterCollectionLandingError(f)).toEqual(new Error("Water landing overlaps the native well"))
  f.landing.origin_m = [-1.5, -4]
  expect(getWaterCollectionLandingError(f)).toEqual(new Error("Rectangle overlaps a blocked grid cell"))
})
it("refuses mismatched labels, overlapping zones and a smaller than usable service place", () => {
  const f = fixture()
  f.landing.rows[0] = "........"
  expect(getWaterCollectionLandingError(f)).toEqual(new Error("Water landing grid disagrees with its occupied zones"))
  f.landing.rows[0] = "EESS..QQ"
  f.landing.zones[2].rect = [2, 0, 2, 2]
  expect(getWaterCollectionLandingError(f)).toEqual(new Error("Water landing grid disagrees with its occupied zones"))
  f.landing.zones[2].rect = [6, 0, 1, 2]
  expect(getWaterCollectionLandingError(f)).toEqual(new Error("Water landing zone leaves its grid or is too narrow"))
})
it("does not let exiting users walk through the next waiting place", () => {
  const f = fixture(),
    service = f.landing.zones.find((zone) => zone.role === "collection"),
    waiting = f.landing.zones.find((zone) => zone.role === "waiting")
  if (!service || !waiting) throw new Error("Missing stages")
  service.role = "waiting"
  waiting.role = "collection"
  expect(getWaterCollectionLandingError(f)?.message).toBe("Water landing flow crosses another stage or leaves its floor")
})
it("does not silently pass a malformed or off-map floor", () => {
  const f = fixture()
  f.landing.origin_m = [1000, 1000]
  expect(getWaterCollectionLandingError(f)).toEqual(new Error("Rectangle overlaps a blocked grid cell"))
  f.landing.rows = []
  expect(getWaterCollectionLandingError(f)).toEqual(new Error("Invalid water collection proposal"))
})
it("does not silently increase the authored one-person waiting capacity", () => {
  const f = fixture()
  f.document.water_collection = {
    purpose: "potable_supply",
    status: "proposed",
    pending: ["混雑時の到着"],
    landing: { ...f.landing, zones: f.landing.zones.map((zone) => ({ ...zone, capacity_people: 2 })) },
  }
  expect(getWaterCollectionLandingError(f)).toEqual(new Error("Invalid water collection proposal"))
})
it("refuses a placement whose root is inside but whose native arms and clothes leave the service zone", () => {
  const f = fixture(),
    review = f.landing.body_review
  if (!review) throw new Error("Missing body review")
  review.placements[0].position = { kind: "relative_m", point: [0.45, 2] }
  expect(getWaterCollectionLandingError(f)?.message).toContain("Standing body leaves its assigned floor")
})
it("requires every stage and the actual registered resident instead of reusing one placement", () => {
  const f = fixture(),
    review = f.landing.body_review
  if (!review) throw new Error("Missing body review")
  review.placements[1].zone = review.placements[0].zone
  expect(getWaterCollectionLandingError(f)).toEqual(new Error("Water body review does not cover each landing zone once"))
  review.resident = "resident-missing"
  expect(getWaterCollectionLandingError(f)).toEqual(new Error("Water body review has no registered resident or native look"))
})
it("does not replace the empty-handed review with a tool or omit inconvenient clips", () => {
  const f = fixture(),
    collection = potableWaterCollectionSchema.parse(f.document.water_collection)
  f.document.water_collection = { ...collection, landing: { ...f.landing, body_review: { ...f.landing.body_review, item: "hoe" } } }
  expect(getWaterCollectionLandingError(f)).toEqual(new Error("Invalid water collection proposal"))
  f.document.water_collection = { ...collection, landing: { ...f.landing, body_review: { ...f.landing.body_review, animations: ["idle"] } } }
  expect(getWaterCollectionLandingError(f)).toEqual(new Error("Invalid water collection proposal"))
})
