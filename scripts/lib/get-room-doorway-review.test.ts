import { expect, it } from "vitest"
import { getRoomDoorwayReview } from "#/scripts/lib/get-room-doorway-review"

it("reports an interior doorway without borrowing a boundary opening", () => {
  const review = getRoomDoorwayReview({ rows: ["###", "#D#", "###"], door: [1, 1], span: 1, cellMetres: 1 })
  expect(review).toEqual({ errors: ["doorway is not on the room boundary", "doorway footprint disagrees with grid"], opening: null })
})
it("rejects nonfinite physical width before returning an opening", () => {
  expect(getRoomDoorwayReview({ rows: ["DD"], door: [0, 0], span: 2, cellMetres: Number.MAX_VALUE })).toEqual({ errors: ["doorway physical width is not finite"], opening: null })
})
it.each([0, -1, 0.5, Infinity])("rejects an invalid span %s", (span) => {
  expect(getRoomDoorwayReview({ rows: ["DD"], door: [0, 0], span, cellMetres: 1 })).toEqual({ errors: ["doorway is narrower than design minimum"], opening: null })
})
