import { expect, it } from "vitest"
import { rectangleFace } from "#/lib/engine/rectangle-face"
it("keeps face centres and tangent widths on all four rectangle edges", () => {
  for (const [side, point, normal, span] of [
    ["n", [10, 19], [0, -1], 4],
    ["s", [10, 21], [0, 1], 4],
    ["w", [8, 20], [-1, 0], 2],
    ["e", [12, 20], [1, 0], 2],
  ] as const) {
    expect(rectangleFace({ x: 10, z: 20, width: 4, depth: 2, side: side })).toEqual({ point, outward: normal, span })
  }
  expect(() => rectangleFace({ x: 10, z: 20, width: 0, depth: 2, side: "n" })).toThrow("Invalid rectangle face")
})
