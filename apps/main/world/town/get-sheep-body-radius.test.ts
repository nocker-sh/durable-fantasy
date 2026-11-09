import { expect, it } from "vitest"
import { getSheepBodyRadius } from "#/world/town/get-sheep-body-radius"
import { SHEEP_SHAPE } from "#/world/town/sheep-shape"

it("uses the actual spawn scale and includes the head and grazing tilt rather than only wool", () => {
  const radius = getSheepBodyRadius(0.85),
    unit = getSheepBodyRadius(1)
  if (radius instanceof Error || unit instanceof Error) throw new Error("Invalid native sheep")
  expect(radius).toBeCloseTo(unit * 0.85, 14)
  expect(radius).toBeGreaterThan(SHEEP_SHAPE.wool.radius * SHEEP_SHAPE.wool.scale[2] * 0.85)
  expect(radius).toBeGreaterThan(0.61 * 0.85)
})

it("rejects invalid animal scales instead of shrinking the body", () => {
  for (const scale of [0, -1, NaN, Infinity]) expect(getSheepBodyRadius(scale)).toBeInstanceOf(Error)
})
