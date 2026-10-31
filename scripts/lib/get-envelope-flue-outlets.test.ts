import { expect, it } from "vitest"
import { getEnvelopeFlueOutlets } from "#/scripts/lib/get-envelope-flue-outlets"

it("accepts absent outlets only when no flue is being compiled", () => {
  for (const absent of [undefined, null, []]) expect(getEnvelopeFlueOutlets(absent, 0)).toEqual([])
  expect(() => getEnvelopeFlueOutlets(undefined, 1)).toThrow("Flue outlet height is missing")
})

it("requires one finite positive outlet height for every compiled flue", () => {
  const outlets = [{ outlet_above_ridge_m: 0.5 }]
  expect(getEnvelopeFlueOutlets(outlets, 1)).toEqual(outlets)
  for (const invalid of [[{ outlet_above_ridge_m: 0 }], [{ outlet_above_ridge_m: Infinity }], [{}], {}]) {
    expect(() => getEnvelopeFlueOutlets(invalid, 1)).toThrow("Flue outlet height is missing")
  }
  expect(() => getEnvelopeFlueOutlets(outlets, 2)).toThrow("Flue outlet height is missing")
})
