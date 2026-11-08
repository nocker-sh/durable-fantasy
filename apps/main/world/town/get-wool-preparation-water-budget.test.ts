import { expect, it } from "vitest"
import { getWoolPreparationWaterBudget } from "#/world/town/get-wool-preparation-water-budget"
const fixture = () => ({ washMl: 20000, rinseMl: 20000, rinseChanges: 2, handwashMl: 1000, supplyMl: 70000, effluentMl: 80000, batchesBeforeService: 1 })

it("reserves washing, each fresh rinse and handwashing against both finite capacities", () => {
  const source = fixture(),
    before = JSON.stringify(source)
  expect(getWoolPreparationWaterBudget(source)).toEqual({ perBatchMl: 61000, reservedMl: 61000, unreservedSupplyMl: 9000, unreservedEffluentMl: 19000 })
  expect(JSON.stringify(source)).toBe(before)
})

it("does not replenish water or disposal room for a second batch or omit a rinse", () => {
  const source = fixture()
  expect(getWoolPreparationWaterBudget({ ...source, batchesBeforeService: 2 })).toEqual(new Error("Wool preparation exceeds reserved fresh water"))
  expect(getWoolPreparationWaterBudget({ ...source, batchesBeforeService: 2, supplyMl: 200000 })).toEqual(new Error("Wool preparation exceeds retained effluent capacity"))
  expect(getWoolPreparationWaterBudget({ ...source, rinseChanges: 3 })).toBeInstanceOf(Error)
  expect(getWoolPreparationWaterBudget({ ...source, supplyMl: 61000, effluentMl: 61000 })).toEqual({ perBatchMl: 61000, reservedMl: 61000, unreservedSupplyMl: 0, unreservedEffluentMl: 0 })
})

it("rejects missing, fractional or unbounded reservations", () => {
  const source = fixture()
  for (const invalid of [0, -1, 0.5, NaN, Infinity]) {
    expect(getWoolPreparationWaterBudget({ ...source, rinseChanges: invalid })).toBeInstanceOf(Error)
    expect(getWoolPreparationWaterBudget({ ...source, washMl: invalid })).toBeInstanceOf(Error)
    expect(getWoolPreparationWaterBudget({ ...source, batchesBeforeService: invalid })).toBeInstanceOf(Error)
  }
  expect(getWoolPreparationWaterBudget({ ...source, rinseChanges: Number.MAX_SAFE_INTEGER })).toBeInstanceOf(Error)
})
