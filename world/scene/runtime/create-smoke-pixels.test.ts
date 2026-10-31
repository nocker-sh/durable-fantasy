import { expect, it } from "vitest"
import { createSmokePixels } from "#/world/scene/runtime/create-smoke-pixels"

it("keeps sharp two-color pixels inside the circular puff and transparent corners", () => {
  const pixels = createSmokePixels()
  expect([pixels.w, pixels.h]).toEqual([12, 12])
  expect(pixels.get(4, 4)).toEqual([214, 206, 200])
  expect(pixels.get(6, 5)).toEqual([168, 162, 166])
  expect(pixels.get(8, 8)).toEqual([168, 162, 166])
  expect(pixels.alpha(0, 0)).toBe(0)
  expect(pixels.alpha(11, 11)).toBe(0)
  expect(pixels.alpha(0, 5)).toBe(0)
  expect(pixels.alpha(5, 5)).toBe(255)
  const colors = new Set(Array.from({ length: 144 }, (_, index) => Array.from(pixels.data.slice(index * 4, index * 4 + 4)).join(",")))
  expect(colors).toEqual(new Set(["0,0,0,0", "214,206,200,255", "168,162,166,255"]))
  expect(createSmokePixels().data).not.toBe(pixels.data)
})
