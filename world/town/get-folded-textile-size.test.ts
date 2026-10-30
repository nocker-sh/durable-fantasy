import { expect, it } from "vitest"
import { getFoldedTextileSize } from "#/world/town/get-folded-textile-size"

it("retains every layer's thickness and original nominal volume before adding authored outer allowance", () => {
  const props = { size: [0.86, 0.025, 1.32], folds: [3, 3], allowance: [0, 0, 0] } satisfies Parameters<typeof getFoldedTextileSize>[0]
  const size = getFoldedTextileSize(props)
  if (size instanceof Error) throw size
  expect(size[1]).toBeCloseTo(0.225, 14)
  expect(size.reduce((volume, length) => volume * length, 1)).toBeCloseTo(
    props.size.reduce((volume, length) => volume * length, 1),
    14,
  )
  const covered = getFoldedTextileSize({ ...props, allowance: [0.02, 0.03, 0.02] })
  if (covered instanceof Error) throw covered
  for (const axis of [0, 1, 2]) expect(covered[axis]).toBeGreaterThan(size[axis])
})

it("refuses compression, fractional folds and numerical overflow instead of returning a smaller parcel", () => {
  const props = { size: [0.86, 0.025, 1.32], folds: [3, 3], allowance: [0.02, 0.03, 0.02] } satisfies Parameters<typeof getFoldedTextileSize>[0]
  for (const invalid of [0, -1, 1.5, NaN, Infinity]) expect(getFoldedTextileSize({ ...props, folds: [invalid, 3] })).toBeInstanceOf(Error)
  expect(getFoldedTextileSize({ ...props, allowance: [0, -0.01, 0] })).toBeInstanceOf(Error)
  expect(getFoldedTextileSize({ ...props, folds: [Number.MAX_SAFE_INTEGER, 2] })).toBeInstanceOf(Error)
  expect(getFoldedTextileSize({ ...props, size: [1, Number.MAX_VALUE, 1] })).toBeInstanceOf(Error)
})

it("refuses vanished cloth dimensions and rounding that erases a positive covering allowance", () => {
  expect(getFoldedTextileSize({ size: [Number.MIN_VALUE, 0.025, 1.32], folds: [3, 3], allowance: [0.02, 0.03, 0.02] })).toBeInstanceOf(Error)
  expect(getFoldedTextileSize({ size: [1, 0.025, 1.32], folds: [1, 1], allowance: [Number.MIN_VALUE, 0, 0] })).toBeInstanceOf(Error)
})
