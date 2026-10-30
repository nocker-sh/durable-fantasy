import { expect, it } from "vitest"
import { certifyLinearInterval } from "./certify-linear-interval"

it("returns a complete ordered sequence when the checker needs subdivision", () => {
  const from = [0, 0, 0] satisfies [number, number, number],
    to = [1, 0, 0] satisfies [number, number, number]
  const result = certifyLinearInterval({ from, to, canClear: (a, b) => b[0] - a[0] <= 0.25 })
  if (result instanceof Error) throw result
  expect(result.intervals.length).toBeGreaterThanOrEqual(4)
  expect(result.intervals[0].from).toEqual(from)
  expect(result.intervals.at(-1)?.to).toEqual(to)
  for (const index of result.intervals.keys()) {
    const interval = result.intervals[index]
    expect(interval.to[0] - interval.from[0]).toBeLessThanOrEqual(0.25)
    if (index) expect(interval.from).toEqual(result.intervals[index - 1].to)
  }
  expect(result.intervals[0].from).not.toBe(from)
})
it("never returns the accepted half when the other half cannot be certified", () => {
  expect(certifyLinearInterval({ from: [0, 0, 0], to: [1, 0, 0], canClear: (_a, b) => b[0] <= 0.5 })).toEqual(new Error("Continuous interval clearance remains unresolved"))
})
it("rejects non-finite endpoints before invoking a checker", () => {
  expect(
    certifyLinearInterval({
      from: [NaN, 0, 0],
      to: [1, 0, 0],
      canClear: () => {
        throw new Error("Invalid endpoints reached the checker")
      },
    }),
  ).toEqual(new Error("Invalid linear interval"))
})
