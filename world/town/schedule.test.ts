import { describe, expect, it } from "vitest"
import { parseTime } from "../core/clock.ts"
import { HOUSES } from "./houses.ts"
import { lampLit, shuttersShut, windowsLit } from "./schedule.ts"

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

  it("houses sleeping by day shut their shutters, and open them when they are up", () => {
    const shut = (t: string) => HOUSES.filter((h) => h.kind !== "vacant" && shuttersShut(h, at(t))).length
    expect(shut("12:00")).toBeGreaterThan(HOUSES.filter((h) => h.kind !== "vacant").length / 2)
    expect(shut("22:00")).toBe(0)
    for (const h of HOUSES) {
      if (h.kind === "vacant") expect(shuttersShut(h, at("12:00"))).toBe(true)
      if (h.household === "guards") expect(shuttersShut(h, at("12:00"))).toBe(false)
      // never shut with the lamp lit inside
      for (const t of ["08:00", "12:00", "16:30", "22:00"]) if (windowsLit(h, at(t))) expect(shuttersShut(h, at(t))).toBe(false)
    }
  })

  it("the lamps are lit in order at dusk and are out in the day", () => {
    expect(lampLit(0, at("16:41"))).toBe(true)
    expect(lampLit(20, at("16:41"))).toBe(false)
    expect(lampLit(20, at("17:30"))).toBe(true)
    expect(lampLit(5, at("13:00"))).toBe(false)
    expect(lampLit(5, at("03:00"))).toBe(true)
  })
})
