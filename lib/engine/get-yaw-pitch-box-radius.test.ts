import { expect, it } from "vitest"
import { getYawPitchBoxRadius } from "#/lib/engine/get-yaw-pitch-box-radius"

it("preserves all headings at zero pitch instead of using only the box's forward extent", () => {
  expect(getYawPitchBoxRadius({ bounds: [-3, 4, -4, 3, 4, 4], maxPitch: 0 })).toBe(5)
})

it("covers the interior yaw that makes a tilted point horizontal", () => {
  const radius = getYawPitchBoxRadius({ bounds: [1, 1, 0, 1, 1, 0], maxPitch: Math.PI / 3 })
  expect(radius).toBeCloseTo(Math.SQRT2, 14)
  expect(radius).toBeGreaterThan(Math.cos(Math.PI / 3) + Math.sin(Math.PI / 3))
})

it("bounds every corner through a limited tilt, including points below the origin", () => {
  const expected = 3 * Math.cos(0.25) + 4 * Math.sin(0.25)
  expect(getYawPitchBoxRadius({ bounds: [3, 4, 0, 3, 4, 0], maxPitch: 0.25 })).toBeCloseTo(expected, 14)
  expect(getYawPitchBoxRadius({ bounds: [3, -4, 0, 3, -4, 0], maxPitch: 0.25 })).toBeCloseTo(expected, 14)
  expect(getYawPitchBoxRadius({ bounds: [0, 0, 0, 0, 0, 0], maxPitch: 0.25 })).toBe(0)
})

it("rejects non-finite, inverted and unbounded envelopes", () => {
  expect(getYawPitchBoxRadius({ bounds: [0, 0, 0, 1, 1, 1], maxPitch: -0.1 })).toBeInstanceOf(Error)
  expect(getYawPitchBoxRadius({ bounds: [0, 0, 0, 1, 1, 1], maxPitch: Math.PI })).toBeInstanceOf(Error)
  expect(getYawPitchBoxRadius({ bounds: [0, 0, NaN, 1, 1, 1], maxPitch: 0 })).toBeInstanceOf(Error)
  expect(getYawPitchBoxRadius({ bounds: [1, 0, 0, 0, 1, 1], maxPitch: 0 })).toBeInstanceOf(Error)
  expect(getYawPitchBoxRadius({ bounds: [1.7e308, 1.7e308, 1.7e308, 1.7e308, 1.7e308, 1.7e308], maxPitch: Math.PI / 2 })).toBeInstanceOf(Error)
})
