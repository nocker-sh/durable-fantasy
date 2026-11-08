import { expect, it } from "vitest"
import { getWaterStockCycle } from "#/world/town/get-water-stock-cycle"
const fixture = () => ({
  initial_ml: 5000,
  capacity_ml: 20000,
  events: [
    { kind: "use", at_min: 100, volume_ml: 5000 },
    { kind: "receive", at_min: 600, volume_ml: 15000 },
    { kind: "use", at_min: 1000, volume_ml: 10000 },
  ],
})

it("preserves the next day's opening stock and reports intermediate extrema without mutating input", () => {
  const cycle = fixture(),
    before = JSON.stringify(cycle)
  expect(getWaterStockCycle(cycle)).toEqual({ initialMl: 5000, finalMl: 5000, minimumMl: 0, maximumMl: 15000, receivedMl: 15000, usedMl: 15000 })
  expect(JSON.stringify(cycle)).toBe(before)
})

it("rejects borrowing breakfast water from a later collection even when the daily totals balance", () => {
  expect(getWaterStockCycle({ ...fixture(), initial_ml: 0 })).toEqual(new Error("Water is reserved before enough stock is available"))
})

it("accepts exact working capacity and rejects overflow before later consumption", () => {
  expect(getWaterStockCycle({ ...fixture(), capacity_ml: 15000 })).not.toBeInstanceOf(Error)
  expect(getWaterStockCycle({ ...fixture(), capacity_ml: 14999 })).toEqual(new Error("Water refill exceeds working capacity"))
  expect(getWaterStockCycle({ ...fixture(), initial_ml: 20001 })).toEqual(new Error("Opening water stock exceeds working capacity"))
})

it("cannot discard surplus or recreate missing water at midnight", () => {
  for (const difference of [-1, 1]) {
    const cycle = fixture()
    cycle.events[2].volume_ml += difference
    expect(getWaterStockCycle(cycle)).toEqual(new Error("Water cycle does not preserve the next day's opening stock"))
  }
})

it("refuses ambiguous simultaneous events, reversed order and invalid units", () => {
  const cycle = fixture()
  for (const minute of [99, 100]) {
    cycle.events[1].at_min = minute
    expect(getWaterStockCycle(cycle)).toEqual(new Error("Water reservations have no strict chronological order"))
  }
  for (const volume of [-1, 0, 0.5, NaN, Infinity]) {
    cycle.events[0].volume_ml = volume
    expect(getWaterStockCycle(cycle)).toEqual(new Error("Invalid proposed water stock cycle"))
  }
})

it("rejects unsafe stock and turnover arithmetic rather than rounding water away", () => {
  expect(getWaterStockCycle({ initial_ml: Number.MAX_SAFE_INTEGER, capacity_ml: Number.MAX_SAFE_INTEGER, events: [{ kind: "receive", at_min: 1, volume_ml: 1 }] })).toEqual(
    new Error("Unbounded water stock arithmetic"),
  )
  expect(
    getWaterStockCycle({
      initial_ml: 0,
      capacity_ml: Number.MAX_SAFE_INTEGER,
      events: [
        { kind: "receive", at_min: 1, volume_ml: Number.MAX_SAFE_INTEGER },
        { kind: "use", at_min: 2, volume_ml: Number.MAX_SAFE_INTEGER },
        { kind: "receive", at_min: 3, volume_ml: 1 },
        { kind: "use", at_min: 4, volume_ml: 1 },
      ],
    }),
  ).toEqual(new Error("Unbounded water stock arithmetic"))
})

it("rejects coincident midnight events across the repeated day boundary", () => {
  const cycle = {
    initial_ml: 1,
    capacity_ml: 2,
    events: [
      { kind: "receive", at_min: 0, volume_ml: 1 },
      { kind: "use", at_min: 1440, volume_ml: 1 },
    ],
  }
  expect(getWaterStockCycle(cycle)).toEqual(new Error("Water reservations have no strict chronological order"))
})

it("permits a single midnight reservation when its adjacent day has no simultaneous event", () => {
  const cycle = {
    initial_ml: 1,
    capacity_ml: 2,
    events: [
      { kind: "receive", at_min: 1, volume_ml: 1 },
      { kind: "use", at_min: 1440, volume_ml: 1 },
    ],
  }
  expect(getWaterStockCycle(cycle)).toMatchObject({ initialMl: 1, finalMl: 1, maximumMl: 2 })
})
