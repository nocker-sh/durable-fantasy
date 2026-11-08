import { expect, it } from "vitest"
import { createWaterStock } from "#/world/core/create-water-stock"
import { prepareWaterBatch } from "#/world/core/prepare-water-batch"
import { applyWaterBatchCommand } from "#/world/core/apply-water-batch-command"
import { getWaterBatchError } from "#/world/core/get-water-batch-error"
import type { WaterBatch, WaterBatchCommand } from "#/world/core/water-batch-types"
const fixture = () => {
  const stock = createWaterStock(2500, 2500)
  if (stock instanceof Error) throw stock
  const prepared = prepareWaterBatch({
    stock,
    amountMl: 500,
    allocations: [
      { id: "first", amountMl: 200, capacityMl: 350 },
      { id: "second", amountMl: 200, capacityMl: 350 },
    ],
  })
  if (prepared instanceof Error) throw prepared
  return { stock: prepared.stock, batch: Object.freeze({ ...prepared.batch, allocations: Object.freeze(prepared.batch.allocations.map((portion) => Object.freeze(portion))) }) }
}
const apply = (batch: WaterBatch, command: WaterBatchCommand) => {
  const changed = applyWaterBatchCommand(batch, command)
  if (changed instanceof Error) throw changed
  expect(getWaterBatchError(changed)).toBeNull()
  return changed
}
it("pours partial portions once, retains the remainder, and never withdraws again from household stock", () => {
  const original = fixture(),
    first = apply(original.batch, { type: "pour", id: "first", amountMl: 70 }),
    completed = apply(first, { type: "pour", id: "first", amountMl: 130 }),
    second = apply(completed, { type: "pour", id: "second", amountMl: 200 })
  expect([first.volumeMl, completed.volumeMl, second.volumeMl]).toEqual([430, 300, 100])
  expect(second.allocations.map((portion) => portion.pouredMl)).toEqual([200, 200])
  expect(second.unallocatedMl).toBe(100)
  expect(applyWaterBatchCommand(second, { type: "pour", id: "first", amountMl: 1 })).toBeInstanceOf(Error)
  expect(original.stock.volumeMl).toBe(2000)
  expect(original.stock.usedMl.cooking).toBe(500)
  expect(original.batch.volumeMl).toBe(500)
  expect(original.batch.allocations[0].pouredMl).toBe(0)
  expect(first.allocations[1]).not.toBe(original.batch.allocations[1])
  const emptied = apply(second, { type: "discard", amountMl: 100 })
  expect(emptied.volumeMl).toBe(0)
  expect(emptied.discardedMl).toBe(100)
})
it("cancels outstanding reservations explicitly without discarding or reclaiming already poured water", () => {
  const batch = fixture().batch,
    poured = apply(batch, { type: "pour", id: "first", amountMl: 50 }),
    cancelled = apply(poured, { type: "cancel", id: "first", amountMl: 150 })
  expect(cancelled.volumeMl).toBe(450)
  expect(cancelled.unallocatedMl).toBe(250)
  expect(cancelled.allocations[0]).toMatchObject({ pouredMl: 50, cancelledMl: 150 })
  expect(applyWaterBatchCommand(cancelled, { type: "cancel", id: "first", amountMl: 1 })).toBeInstanceOf(Error)
  expect(applyWaterBatchCommand(cancelled, { type: "discard", amountMl: 251 })).toBeInstanceOf(Error)
  const allCancelled = apply(cancelled, { type: "cancel", id: "second", amountMl: 200 }),
    emptied = apply(allCancelled, { type: "discard", amountMl: 450 })
  expect(emptied.volumeMl).toBe(0)
  expect(emptied.discardedMl).toBe(450)
  expect(emptied.allocations[0].pouredMl).toBe(50)
})
it("rejects malformed commands and forged balances before making any transfer", () => {
  const batch = fixture().batch
  for (const amountMl of [0, -1, 0.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, 501]) {
    for (const type of ["pour", "cancel"] satisfies ("pour" | "cancel")[]) expect(applyWaterBatchCommand(batch, { type, id: "first", amountMl })).toBeInstanceOf(Error)
    expect(applyWaterBatchCommand(batch, { type: "discard", amountMl })).toBeInstanceOf(Error)
  }
  expect(applyWaterBatchCommand(batch, { type: "pour", id: "missing", amountMl: 1 })).toBeInstanceOf(Error)
  expect(applyWaterBatchCommand(batch, { type: "discard", amountMl: 101 })).toBeInstanceOf(Error)
  const forged: WaterBatch[] = [
    { ...batch, volumeMl: 499 },
    { ...batch, unallocatedMl: 101 },
    { ...batch, initialMl: 501 },
    { ...batch, discardedMl: 1 },
    { ...batch, allocations: [] },
    { ...batch, allocations: [batch.allocations[0], batch.allocations[0]] },
    { ...batch, allocations: [{ ...batch.allocations[0], capacityMl: 199 }, batch.allocations[1]] },
    { ...batch, allocations: [{ ...batch.allocations[0], pouredMl: 201 }, batch.allocations[1]] },
  ]
  for (const invalid of forged) expect(applyWaterBatchCommand(invalid, { type: "pour", id: "first", amountMl: 1 })).toBeInstanceOf(Error)
  const cancelledForgery: WaterBatch = {
    initialMl: 500,
    volumeMl: 500,
    unallocatedMl: 500,
    discardedMl: 0,
    allocations: [{ id: "first", amountMl: 1000, capacityMl: 1000, pouredMl: 0, cancelledMl: 1000 }],
  }
  expect(getWaterBatchError(cancelledForgery)).toBeInstanceOf(Error)
  expect(batch.volumeMl).toBe(500)
})
it("preserves exact accounting near the safe integer boundary", () => {
  const batch: WaterBatch = {
    initialMl: Number.MAX_SAFE_INTEGER,
    volumeMl: Number.MAX_SAFE_INTEGER,
    discardedMl: 0,
    unallocatedMl: 0,
    allocations: [{ id: "large", amountMl: Number.MAX_SAFE_INTEGER, capacityMl: Number.MAX_SAFE_INTEGER, pouredMl: 0, cancelledMl: 0 }],
  }
  const poured = apply(batch, { type: "pour", id: "large", amountMl: Number.MAX_SAFE_INTEGER - 1 }),
    cancelled = apply(poured, { type: "cancel", id: "large", amountMl: 1 }),
    emptied = apply(cancelled, { type: "discard", amountMl: 1 })
  expect(emptied.volumeMl).toBe(0)
  expect(emptied.allocations[0].pouredMl + emptied.discardedMl).toBe(Number.MAX_SAFE_INTEGER)
})
