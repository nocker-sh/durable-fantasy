import { expect, it } from "vitest"
import { getDishwaterCaptureBudget } from "#/world/town/get-dishwater-capture-budget"
const budget = { washMl: 3000, reservedBatches: 3, basinCapacityMl: 16144, receiverCapacityMl: 33696, initialRetainedMl: 0 }

it("retains the complete reservation and keeps an existing load rather than evaporating it", () => {
  const before = JSON.stringify(budget)
  expect(getDishwaterCaptureBudget(budget)).toEqual({ requiredFreshMl: 9000, retainedMl: 9000, remainingRetentionMl: 24696 })
  expect(getDishwaterCaptureBudget({ ...budget, initialRetainedMl: 1000 })).toEqual({ requiredFreshMl: 9000, retainedMl: 10000, remainingRetentionMl: 23696 })
  expect(JSON.stringify(budget)).toBe(before)
})

it("accepts exact capacity but rejects even one extra millilitre, including the initial load", () => {
  expect(getDishwaterCaptureBudget({ ...budget, receiverCapacityMl: 9000 })).not.toBeInstanceOf(Error)
  expect(getDishwaterCaptureBudget({ ...budget, receiverCapacityMl: 9000, initialRetainedMl: 1 })).toEqual(new Error("Reserved dishwater exceeds retained effluent capacity"))
  expect(getDishwaterCaptureBudget({ ...budget, receiverCapacityMl: 8999 })).toBeInstanceOf(Error)
  expect(getDishwaterCaptureBudget({ ...budget, basinCapacityMl: 3000 })).not.toBeInstanceOf(Error)
  expect(getDishwaterCaptureBudget({ ...budget, basinCapacityMl: 2999 })).toEqual(new Error("Reserved wash exceeds basin working capacity"))
})

it("rejects invalid units, counts and initial quantities without accepting arithmetic overflow", () => {
  for (const value of [0, -1, 0.5, NaN, Infinity]) {
    expect(getDishwaterCaptureBudget({ ...budget, washMl: value })).toBeInstanceOf(Error)
    expect(getDishwaterCaptureBudget({ ...budget, reservedBatches: value })).toBeInstanceOf(Error)
    expect(getDishwaterCaptureBudget({ ...budget, receiverCapacityMl: value })).toBeInstanceOf(Error)
  }
  for (const value of [-1, 0.5, NaN, Infinity]) expect(getDishwaterCaptureBudget({ ...budget, initialRetainedMl: value })).toBeInstanceOf(Error)
  expect(getDishwaterCaptureBudget({ ...budget, washMl: Number.MAX_SAFE_INTEGER, reservedBatches: 2 })).toEqual(new Error("Unbounded dishwater reservation"))
  expect(getDishwaterCaptureBudget({ ...budget, initialRetainedMl: Number.MAX_SAFE_INTEGER })).toEqual(new Error("Unbounded dishwater reservation"))
})

it("carries retained effluent into the next day and eventually refuses a full day without service", () => {
  const retained = { value: budget.initialRetainedMl }
  for (const expected of [9000, 18000, 27000]) {
    const day = getDishwaterCaptureBudget({ ...budget, initialRetainedMl: retained.value })
    if (day instanceof Error) throw day
    expect(day.retainedMl).toBe(expected)
    retained.value = day.retainedMl
  }

  expect(getDishwaterCaptureBudget({ ...budget, initialRetainedMl: retained.value })).toEqual(new Error("Reserved dishwater exceeds retained effluent capacity"))
  expect(retained.value).toBe(27000)
})
