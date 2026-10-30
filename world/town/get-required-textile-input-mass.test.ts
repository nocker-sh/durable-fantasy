import { expect, it } from "vitest"
import { getRequiredTextileInputMass } from "#/world/town/get-required-textile-input-mass"

it("rounds inputs upward while retaining enough whole grams at the specified yield", () => {
  expect(getRequiredTextileInputMass({ outputG: 2520, yieldPermille: 950 })).toBe(2653)
  expect(getRequiredTextileInputMass({ outputG: 2653, yieldPermille: 900 })).toBe(2948)
  expect(getRequiredTextileInputMass({ outputG: 2948, yieldPermille: 650 })).toBe(4536)
  expect(Math.floor((4536 * 650) / 1000)).toBe(2948)
  expect(Math.floor((4535 * 650) / 1000)).toBe(2947)
  expect(getRequiredTextileInputMass({ outputG: Number.MAX_SAFE_INTEGER, yieldPermille: 1000 })).toBe(Number.MAX_SAFE_INTEGER)
})

it("rejects fractional, absent and unbounded masses and impossible yields", () => {
  for (const invalid of [0, -1, 0.5, NaN, Infinity]) expect(getRequiredTextileInputMass({ outputG: invalid, yieldPermille: 900 })).toBeInstanceOf(Error)
  for (const invalid of [0, -1, 0.5, 1001, NaN, Infinity]) expect(getRequiredTextileInputMass({ outputG: 100, yieldPermille: invalid })).toBeInstanceOf(Error)
  expect(getRequiredTextileInputMass({ outputG: Number.MAX_SAFE_INTEGER, yieldPermille: 999 })).toBeInstanceOf(Error)
})
