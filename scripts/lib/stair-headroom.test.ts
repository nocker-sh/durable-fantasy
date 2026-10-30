import { expect, it } from "vitest"
import { stairHeadroom, type StairHeadroom } from "#/scripts/lib/stair-headroom"
const section = (): StairHeadroom => ({ bottom_m: 0, top_m: 2.52, lower_ceiling_m: 2.32, upper_ceiling_m: 4.72, risers: 14, going_m: 0.28, opening_length_m: 3.64 })
it("derives headroom from the steps, ceilings and floor opening", () => {
  expect(stairHeadroom(section()).minimum_m).toBeCloseTo(2.2)
})
it("finds a low ceiling over the covered part of a tread instead of testing only its centre", () => {
  const s = section()
  s.opening_length_m = 3.35
  expect(stairHeadroom(s).minimum_m).toBeCloseTo(1.96)
  s.opening_length_m = 3.36
  expect(stairHeadroom(s).minimum_m).toBeCloseTo(2.14)
})
it("includes the upper and lower landing in the clearance envelope", () => {
  const s = section()
  s.upper_ceiling_m = 4.32
  expect(stairHeadroom(s).minimum_m).toBeCloseTo(1.8)
  s.upper_ceiling_m = 4.72
  s.lower_ceiling_m = 1.7
  expect(stairHeadroom(s).minimum_m).toBeCloseTo(1.7)
})
it("does not infer a floor opening or ceiling from a declared headroom number", () => {
  expect(stairHeadroom({ ...section(), opening_length_m: null }).minimum_m).toBeNull()
  expect(stairHeadroom({ ...section(), upper_ceiling_m: null }).minimum_m).toBeNull()
})
it("rejects an opening which cuts into the landing beyond the flight", () => {
  expect(stairHeadroom({ ...section(), opening_length_m: 4 }).problems).toEqual(["Floor opening extends beyond the stair flight"])
})
it("rejects ceiling levels which put an occupied landing inside the ceiling", () => {
  expect(stairHeadroom({ ...section(), upper_ceiling_m: 2.52 }).problems).toEqual(["Stair ceiling elevations disagree with floors"])
})
it("detects the overhead floor when no opening is provided", () => {
  expect(stairHeadroom({ ...section(), opening_length_m: 0 }).minimum_m).toBeLessThan(0)
})
