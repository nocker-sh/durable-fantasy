import { describe, expect, it } from "vitest"
import { parseTime } from "../core/clock.ts"
import { HOUSES } from "./houses.ts"
import { lampLit, windowsLit } from "./schedule.ts"

const at = (t: string) => parseTime(t)!

describe("the town's hours", () => {
  it("windows light up one by one at dusk, are lit through the night, and go out in the day", () => {
    const lit = (t: string) => HOUSES.filter((h) => windowsLit(h, at(t))).length
    expect(lit("12:00")).toBe(0)
    expect(lit("16:30")).toBeGreaterThan(0)
    expect(lit("16:30")).toBeLessThan(lit("19:00"))
    expect(lit("23:00")).toBeGreaterThan(lit("12:00"))
    expect(HOUSES.filter((h) => h.kind === "vacant").some((h) => windowsLit(h, at("22:00")))).toBe(false)
  })

  it("the lamps are lit in order at dusk and are out in the day", () => {
    expect(lampLit(0, at("16:41"))).toBe(true)
    expect(lampLit(20, at("16:41"))).toBe(false)
    expect(lampLit(20, at("17:30"))).toBe(true)
    expect(lampLit(5, at("13:00"))).toBe(false)
    expect(lampLit(5, at("03:00"))).toBe(true)
  })
})
