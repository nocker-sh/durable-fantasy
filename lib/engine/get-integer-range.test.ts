import { expect, it } from "vitest"
import { getIntegerRange } from "#/lib/engine/get-integer-range"

it("includes the start and excludes the end in ascending order", () => {
  expect(getIntegerRange(-2, 3)).toEqual([-2, -1, 0, 1, 2])
  expect(getIntegerRange(4, 5)).toEqual([4])
})

it("returns no steps for empty or reversed intervals", () => {
  expect(getIntegerRange(3, 3)).toEqual([])
  expect(getIntegerRange(4, 2)).toEqual([])
})

it("rejects fractional, non-finite and unsafe bounds before allocating", () => {
  for (const value of [0.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    expect(() => getIntegerRange(value, 3)).toThrow(RangeError)
    expect(() => getIntegerRange(0, value)).toThrow(RangeError)
  }
  expect(() => getIntegerRange(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)).toThrow(RangeError)
})
