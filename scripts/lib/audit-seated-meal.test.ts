import { seatedMealReviewSchema } from "#/scripts/lib/seated-meal-review-schema"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditSeatedMeal } from "#/scripts/lib/audit-seated-meal"
import { auditRoomGrid } from "#/scripts/lib/audit-room-grid"
import { auditHouseholdMeals } from "#/scripts/lib/household-meals"

const read = (path: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${path}.md`, import.meta.url), "utf8"))
const fixture = () => {
  const room = read("rooms/room-h1-1")
  const documents = new Map([room, read("buildings/building-h1"), read("residents/resident-ヴィルヘルム"), read("residents/resident-ゾフィー")].map((document) => [document.id, document]))
  return { room, documents }
}
it("checks both named diners at their authored opposite-facing seats", () => {
  const fixtureData = fixture()
  expect(auditRoomGrid(fixtureData.room)).toEqual([])
  expect(auditHouseholdMeals(fixtureData.documents)).toEqual([])
  expect(auditSeatedMeal(fixtureData.room, fixtureData.documents)).toEqual([])
})
it("rejects a seat raised off the floor and a table leg moved into the shoes", () => {
  const raised = fixture(),
    chair = raised.room.furniture?.find((furniture) => furniture.symbol === "A")
  if (!chair?.seat) throw new Error("Missing dining seat")
  chair.seat.height_m = 0.45
  expect(auditSeatedMeal(raised.room, raised.documents).some((error) => error.includes("Seated shoe does not meet its support plane"))).toBe(true)
  const crowded = fixture(),
    table = crowded.room.furniture?.find((furniture) => furniture.symbol === "T")
  if (!table?.work_surface) throw new Error("Missing dining table")
  table.work_surface.leg_inset_m = 0.17
  expect(auditSeatedMeal(crowded.room, crowded.documents).some((error) => error.includes("Seated shoe intersects the table"))).toBe(true)
})
it("retains the unfinished operation gate and rejects malformed review metadata", () => {
  const fixtureData = fixture()
  fixtureData.room.design_gate = "通過"
  expect(auditSeatedMeal(fixtureData.room, fixtureData.documents)).toContain("room-h1-1: Seated transitions and operation remain unverified")
  fixtureData.room.seated_body_review = { scope: "all", status: "complete" }
  expect(auditSeatedMeal(fixtureData.room, fixtureData.documents)).toContain("room-h1-1: Invalid seated meal review")
})

it("requires garment reviews to name distinct diners and refuses an outfit outside the reviewed profile", () => {
  const f = fixture(),
    parsed = seatedMealReviewSchema.parse(f.room),
    review = parsed.seated_body_review.garment_seat
  if (!review) throw new Error("Missing garment review")
  review.residents.push(review.residents[0])
  f.room.seated_body_review = parsed.seated_body_review
  expect(auditSeatedMeal(f.room, f.documents)).toContain("room-h1-1: Invalid seated meal review")
  review.residents = ["resident-unknown"]
  expect(auditSeatedMeal(f.room, f.documents)).toContain("room-h1-1: Invalid seated meal review")
  parsed.seated_body_review.skirt_seat = undefined
  review.residents = ["resident-ゾフィー"]
  expect(auditSeatedMeal(f.room, f.documents).some((message) => message.includes("Unavailable reviewed garment or seat"))).toBe(true)
})

it("rejects a diner assigned to incompatible garment profiles", () => {
  const f = fixture(),
    review = seatedMealReviewSchema.parse(f.room).seated_body_review
  if (!review.skirt_seat || !review.garment_seat) throw new Error("Missing garment profiles")
  review.garment_seat.residents = [...review.skirt_seat.residents]
  f.room.seated_body_review = review
  expect(auditSeatedMeal(f.room, f.documents)).toContain("room-h1-1: Invalid seated meal review")
})
