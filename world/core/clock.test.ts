import { describe, expect, it } from "vitest"
import { daylight } from "#/world/core/daylight"
import { dayOf } from "#/world/core/day-of"
import { dusk } from "#/world/core/dusk"
import { jstMinutes } from "#/world/core/jst-minutes"
import { parseTime } from "#/world/core/parse-time"
import { phase } from "#/world/core/phase"
import { within } from "#/world/core/within"

describe("the clock and the light", () => {
  it("runs on Japan time", () => {
    expect(jstMinutes(Date.UTC(2026, 9, 21, 0, 0))).toBe(9 * 60)
    expect(jstMinutes(Date.UTC(2026, 9, 21, 15, 30))).toBe(30)
  })

  it("is dark until nine, light by half past ten, red at dusk and dark by six", () => {
    expect(daylight(parseTime("03:00")!)).toBe(0)
    expect(daylight(parseTime("09:00")!)).toBe(0)
    expect(daylight(parseTime("12:00")!)).toBe(1)
    expect(daylight(parseTime("16:30")!)).toBeGreaterThan(0.2)
    expect(daylight(parseTime("16:30")!)).toBeLessThan(0.8)
    expect(daylight(parseTime("18:00")!)).toBe(0)
    expect(dusk(parseTime("16:45")!)).toBeGreaterThan(0.8)
    expect(dusk(parseTime("12:00")!)).toBe(0)
    expect(phase(parseTime("10:00")!)).toBe("夜明け")
    expect(phase(parseTime("23:00")!)).toBe("夜")
  })

  it("knows spans that run past midnight", () => {
    expect(within(parseTime("23:00")!, parseTime("16:00")!, parseTime("07:00")!)).toBe(true)
    expect(within(parseTime("06:59")!, parseTime("16:00")!, parseTime("07:00")!)).toBe(true)
    expect(within(parseTime("12:00")!, parseTime("16:00")!, parseTime("07:00")!)).toBe(false)
  })
})

it.each([
  ["2026-10-26T21:00:00Z", "2026-10-26", "2026-10-27"],
  ["2025-12-31T21:00:00Z", "2025-12-31", "2026-01-01"],
  ["2024-02-28T21:00:00Z", "2024-02-28", "2024-02-29"],
  ["2024-02-29T21:00:00Z", "2024-02-29", "2024-03-01"],
])("turns the errand and friendship day over at six in Japan: %s", (at, before, after) => {
  const now = Date.parse(at)
  expect(dayOf(now - 1)).toBe(before)
  expect(dayOf(now)).toBe(after)
  expect(dayOf(now + 86_400_000 - 1)).toBe(after)
})
