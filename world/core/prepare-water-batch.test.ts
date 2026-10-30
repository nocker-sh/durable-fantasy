import { expect, it } from "vitest"
import { prepareWaterBatch } from "#/world/core/prepare-water-batch"
import { createWaterStock } from "#/world/core/create-water-stock"
import { applyWaterStockCommand } from "#/world/core/apply-water-stock-command"
const fixture = () => {
  const stock = createWaterStock(2500, 2500)
  if (stock instanceof Error) throw stock
  return Object.freeze({ ...stock, usedMl: Object.freeze(stock.usedMl) })
}
it("reserves one batch once and keeps unallocated water in the same batch", () => {
  const stock = fixture(),
    allocations = [
      { id: "first", amountMl: 200, capacityMl: 350 },
      { id: "second", amountMl: 200, capacityMl: 350 },
    ]
  const batch = prepareWaterBatch({ stock, amountMl: 500, allocations })
  if (batch instanceof Error) throw batch
  expect(batch.stock.volumeMl).toBe(2000)
  expect(batch.stock.usedMl).toEqual({ drinking: 0, cooking: 500 })
  expect(batch.batch.volumeMl).toBe(500)
  expect(batch.batch.unallocatedMl).toBe(100)
  allocations[0].amountMl = 1
  expect(batch.batch.allocations[0].amountMl).toBe(200)
  expect(stock.volumeMl).toBe(2500)
})
it("rejects shortage, absence, overfilled receivers and invalid allocation arithmetic", () => {
  const stock = fixture(),
    allocations = [{ id: "cup", amountMl: 200, capacityMl: 350 }]
  for (const amountMl of [0, -1, 0.5, NaN, 2501]) expect(prepareWaterBatch({ stock, amountMl, allocations })).toBeInstanceOf(Error)
  expect(prepareWaterBatch({ stock, amountMl: 100, allocations })).toEqual(new Error("Water portions exceed their batch"))
  expect(prepareWaterBatch({ stock, amountMl: 500, allocations: [{ ...allocations[0], capacityMl: 199 }] })).toEqual(new Error("Water allocation leaves its receiving vessel"))
  expect(prepareWaterBatch({ stock, amountMl: 500, allocations: [allocations[0], allocations[0]] })).toEqual(new Error("Invalid water batch allocation"))
  expect(prepareWaterBatch({ stock, amountMl: 500, allocations: [] })).toBeInstanceOf(Error)
  const away = applyWaterStockCommand(stock, { type: "leave_for_source" })
  if (away instanceof Error) throw away
  expect(prepareWaterBatch({ stock: away, amountMl: 500, allocations })).toEqual(new Error("Household water is unavailable while its vessel is away"))
})
