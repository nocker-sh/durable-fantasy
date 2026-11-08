import { expect, it } from "vitest"
import { getNativeFixedCuboidClearanceError } from "#/world/scene/figure/get-native-fixed-cuboid-clearance-error"
import { RESIDENT_LOOKS } from "#/world/town/residents"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
const look = RESIDENT_LOOKS[0],
  skeleton = skelFor(look, "idle", 0)
const fixed = { x0: 20, x1: 21, bottom: 0, top: 1, z0: 20, z1: 21 }

it("checks unchanged native figures under each heading, including obstacles at the torso", () => {
  const before = structuredClone(skeleton)
  for (const heading of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
    const props = { look, skeleton, body: [2, 3] satisfies readonly [number, number], rootY: 0.1, heading, ceiling: 2.2 }
    expect(getNativeFixedCuboidClearanceError({ ...props, obstacles: [fixed] })).toBeNull()
    const error = getNativeFixedCuboidClearanceError({ ...props, obstacles: [{ x0: 1.9, x1: 2.1, bottom: 0.3, top: 0.8, z0: 2.9, z1: 3.1 }] })
    expect(error).toBeInstanceOf(Error)
    expect(error?.cause).toEqual({ obstacle: 0, primitive: expect.any(Number) })
  }
  expect(skeleton).toEqual(before)
})

it("rejects invalid transforms even without obstacles, and malformed solids", () => {
  const props = { look, skeleton, body: [0, 0] satisfies readonly [number, number], rootY: 0, heading: 0, ceiling: 2.2 }
  for (const rootY of [NaN, Infinity]) expect(getNativeFixedCuboidClearanceError({ ...props, rootY, obstacles: [] })).toBeInstanceOf(Error)
  expect(getNativeFixedCuboidClearanceError({ ...props, body: [NaN, 0], obstacles: [] })).toBeInstanceOf(Error)
  for (const obstacle of [
    { ...fixed, top: NaN },
    { ...fixed, x1: fixed.x0 },
  ])
    expect(getNativeFixedCuboidClearanceError({ ...props, obstacles: [obstacle] })).toBeInstanceOf(Error)
  expect(getNativeFixedCuboidClearanceError({ ...props, ceiling: 0.7, obstacles: [] })?.message).toContain("ceiling")
})
