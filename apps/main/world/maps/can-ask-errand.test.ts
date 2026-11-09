import { expect, it } from "vitest"
import { errandOf } from "#/world/core/errand-of"
import { parseTime } from "#/world/core/parse-time"
import { canAskErrand } from "#/world/maps/can-ask-errand"

const asks = (id: string, time: string) => canAskErrand(errandOf(id)!, parseTime(time)!)

it("asks for the muffler only while Wilhelm can still be met before the day turns", () => {
  expect(asks("magdalena-muffler", "20:29")).toBe(true)
  expect(asks("magdalena-muffler", "20:30")).toBe(false)
  expect(asks("magdalena-muffler", "22:00")).toBe(false)
  expect(asks("magdalena-muffler", "05:59")).toBe(false)
  expect(asks("magdalena-muffler", "06:00")).toBe(true)
})

it("does not ask for a parcel to be carried to someone standing beside the asker", () => {
  expect(asks("jakob-fish", "06:10")).toBe(false)
  expect(asks("jakob-fish", "06:30")).toBe(true)
  expect(asks("matthias-wool", "17:10")).toBe(false)
  expect(asks("matthias-wool", "15:00")).toBe(true)
  expect(asks("theo-parcel", "15:40")).toBe(false)
  expect(asks("theo-parcel", "16:10")).toBe(true)
})

it("stops asking for things to be brought when too little of the errand day is left", () => {
  expect(asks("irmgard-herbs", "05:29")).toBe(true)
  expect(asks("irmgard-herbs", "05:30")).toBe(false)
  expect(asks("irmgard-herbs", "06:00")).toBe(true)
})
