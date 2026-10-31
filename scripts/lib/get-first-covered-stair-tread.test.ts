import { expect, it } from "vitest"
import { getFirstCoveredStairTread } from "#/scripts/lib/get-first-covered-stair-tread"

it("uses a strict product comparison at the ceiling boundary", () => {
  expect(getFirstCoveredStairTread({ first: 1, last: 14, going: 0.28, threshold: 12 * 0.28 })).toBe(13)
  expect(getFirstCoveredStairTread({ first: 1, last: 14, going: 0.28, threshold: 12 * 0.28 - 1e-9 })).toBe(12)
})
it("retains the sentinel when every tread is in the opening", () => {
  expect(getFirstCoveredStairTread({ first: 1, last: 14, going: 0.28, threshold: 13 * 0.28 + 1e-9 })).toBe(14)
})
it("retains exact integer bounds across the largest safe stair range", () => {
  expect(getFirstCoveredStairTread({ first: 1, last: Number.MAX_SAFE_INTEGER, going: 1, threshold: Number.MAX_SAFE_INTEGER - 2 })).toBe(Number.MAX_SAFE_INTEGER - 1)
})
