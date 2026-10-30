import { expect, it } from "vitest"
import { createWaterStock } from "#/world/core/create-water-stock"
import { applyWaterStockCommand } from "#/world/core/apply-water-stock-command"
import { getWaterStockError } from "#/world/core/get-water-stock-error"
import type { WaterStock, WaterStockCommand } from "#/world/core/water-stock-types"
const stock = (volumeMl = 500, limitMl = 2500): WaterStock => {
  const created = createWaterStock(limitMl, volumeMl)
  if (created instanceof Error) throw created
  return Object.freeze({ ...created, usedMl: Object.freeze(created.usedMl) })
}
const apply = (state: WaterStock, command: WaterStockCommand): WaterStock => {
  const next = applyWaterStockCommand(state, command)
  if (next instanceof Error) throw next
  expect(getWaterStockError(next)).toBeNull()
  return Object.freeze({ ...next, usedMl: Object.freeze(next.usedMl) })
}
const toSource = (state: WaterStock) => apply(apply(state, { type: "leave_for_source" }), { type: "arrive_at_source" })
const toHome = (state: WaterStock) => apply(apply(state, { type: "leave_source" }), { type: "return_home" })
it("preserves the same water while away and records receipts and each household outflow exactly", () => {
  const initial = stock(),
    drinking = apply(initial, { type: "use", purpose: "drinking", amountMl: 200 }),
    away = toSource(drinking)
  expect(away.volumeMl).toBe(300)
  expect(applyWaterStockCommand(away, { type: "use", purpose: "cooking", amountMl: 100 })).toEqual(new Error("Household water is unavailable while its vessel is away"))
  const filled = apply(away, { type: "fill", amountMl: 2200 }),
    returned = toHome(filled),
    cooking = apply(returned, { type: "use", purpose: "cooking", amountMl: 2000 }),
    empty = apply(cooking, { type: "discard", amountMl: 500 })
  expect(returned.volumeMl).toBe(2500)
  expect(empty.volumeMl).toBe(0)
  expect(empty.receivedMl).toBe(2200)
  expect(empty.usedMl).toEqual({ drinking: 200, cooking: 2000 })
  expect(empty.discardedMl).toBe(500)
  expect(initial).toEqual(createWaterStock(2500, 500))
})
it("returning and maintenance never create water or silently erase a remainder", () => {
  const initial = stock(),
    returned = toHome(toSource(initial))
  expect(returned).toEqual(initial)
  expect(applyWaterStockCommand(initial, { type: "begin_maintenance" })).toBeInstanceOf(Error)
  const emptied = apply(initial, { type: "discard", amountMl: 500 }),
    maintenance = apply(emptied, { type: "begin_maintenance" })
  expect(applyWaterStockCommand(maintenance, { type: "use", purpose: "drinking", amountMl: 1 })).toBeInstanceOf(Error)
  expect(applyWaterStockCommand(maintenance, { type: "fill", amountMl: 500 })).toEqual(new Error("Water vessel must reach its source before filling"))
  const clean = apply(maintenance, { type: "end_maintenance" })
  expect(clean.volumeMl).toBe(0)
  expect(clean.discardedMl).toBe(500)
  expect(applyWaterStockCommand(clean, { type: "use", purpose: "drinking", amountMl: 1 })).toBeInstanceOf(Error)
})
it("requires arrival at the source and respects the operating limit including carried leftovers", () => {
  const initial = stock()
  expect(applyWaterStockCommand(initial, { type: "fill", amountMl: 1 })).toBeInstanceOf(Error)
  const away = toSource(initial)
  expect(applyWaterStockCommand(away, { type: "fill", amountMl: 2001 })).toEqual(new Error("Water receipt exceeds the operating fill limit"))
  const full = apply(away, { type: "fill", amountMl: 2000 })
  expect(applyWaterStockCommand(full, { type: "fill", amountMl: 1 })).toBeInstanceOf(Error)
  expect(applyWaterStockCommand(away, { type: "leave_for_source" })).toBeInstanceOf(Error)
  expect(applyWaterStockCommand(initial, { type: "return_home" })).toBeInstanceOf(Error)
})
it("rejects invalid quantities and accounting overflow without mutating the previous stock", () => {
  for (const amount of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) expect(createWaterStock(2500, amount)).toBeInstanceOf(Error)
  expect(createWaterStock(0, 0)).toBeInstanceOf(Error)
  expect(createWaterStock(2500, 2501)).toBeInstanceOf(Error)
  const initial = stock(),
    away = toSource(initial)
  for (const amountMl of [-1, 0, 0.5, NaN, Infinity, 501]) expect(applyWaterStockCommand(initial, { type: "use", purpose: "drinking", amountMl })).toBeInstanceOf(Error)
  for (const amountMl of [-1, 0, 0.5, NaN, Infinity]) expect(applyWaterStockCommand(away, { type: "fill", amountMl })).toBeInstanceOf(Error)
  const maximum = stock(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
    consumed = apply(maximum, { type: "use", purpose: "cooking", amountMl: Number.MAX_SAFE_INTEGER }),
    atSource = toSource(consumed)
  expect(applyWaterStockCommand(atSource, { type: "fill", amountMl: 1 })).toEqual(new Error("Water stock does not conserve its recorded volume"))
  expect(initial.volumeMl).toBe(500)
  expect(away.receivedMl).toBe(0)
})
it("refuses inconsistent persisted state before applying any movement or use", () => {
  const initial = stock(),
    inconsistent = { ...initial, volumeMl: 499 }
  expect(getWaterStockError(inconsistent)).toEqual(new Error("Water stock does not conserve its recorded volume"))
  expect(applyWaterStockCommand(inconsistent, { type: "leave_for_source" })).toEqual(new Error("Water stock does not conserve its recorded volume"))
  expect(getWaterStockError({ ...initial, phase: "maintenance" })).toEqual(new Error("Water vessel maintenance requires an empty vessel"))
})

it("distinguishes leaving, arrival and the return journey instead of refilling in transit", () => {
  const initial = stock(),
    outbound = apply(initial, { type: "leave_for_source" })
  expect(outbound.phase).toBe("outbound")
  expect(applyWaterStockCommand(outbound, { type: "fill", amountMl: 100 })).toBeInstanceOf(Error)
  expect(applyWaterStockCommand(outbound, { type: "return_home" })).toBeInstanceOf(Error)
  const source = apply(outbound, { type: "arrive_at_source" }),
    inbound = apply(source, { type: "leave_source" })
  expect(applyWaterStockCommand(source, { type: "return_home" })).toBeInstanceOf(Error)
  expect(applyWaterStockCommand(inbound, { type: "fill", amountMl: 100 })).toBeInstanceOf(Error)
  expect(applyWaterStockCommand(inbound, { type: "use", purpose: "drinking", amountMl: 100 })).toBeInstanceOf(Error)
  expect(apply(inbound, { type: "return_home" })).toEqual(initial)
})
