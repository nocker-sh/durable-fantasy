import { expect, it } from "vitest"
import { getHemmedTextileCutSize } from "#/world/town/get-hemmed-textile-cut-size"

it("adds each edge's total allowance without reducing the finished field", () => {
  const size = getHemmedTextileCutSize({ finished: [0.86, 1.32], edgeAllowance: 0.02 })
  if (size instanceof Error) throw size
  expect(size[0]).toBeCloseTo(0.9, 14)
  expect(size[1]).toBeCloseTo(1.36, 14)
})

it("refuses absent, negative, lost and overflowing allowance", () => {
  for (const edgeAllowance of [0, -0.02, NaN, Infinity, Number.MIN_VALUE, Number.MAX_VALUE]) expect(getHemmedTextileCutSize({ finished: [1, 1], edgeAllowance })).toBeInstanceOf(Error)
  expect(getHemmedTextileCutSize({ finished: [NaN, 1], edgeAllowance: 0.02 })).toBeInstanceOf(Error)
})
