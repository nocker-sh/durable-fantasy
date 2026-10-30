import { expect, it } from "vitest"
import { storedToolParts } from "#/world/town/stored-tool"
import { scaleShelf } from "#/world/town/scale-shelf"
it("rests the blade on its board and joins its narrow handle without filling the envelope", () => {
  const bounds = { part: "contents" as const, x0: 0, x1: 0.18, z0: 0, z1: 0.04, y0: 0.05, y1: 1.15 },
    tool = { handleWidth: 0.02, bladeLength: 0.12 }
  const [blade, handle] = storedToolParts(bounds, tool)
  expect(blade.y0).toBe(0.05)
  expect(handle.y0).toBe(blade.y1)
  expect(handle.y1).toBe(1.15)
  expect(handle.x1 - handle.x0).toBeCloseTo(0.02)
  expect(handle.z1 - handle.z0).toBeCloseTo(0.02)
  expect(() => storedToolParts(bounds, { ...tool, handleWidth: 0.1 })).toThrow("Invalid")
  const shelf = scaleShelf(
    { height: 1.4, board: 0.025, levels: [0.05, 1.4], front: "e", items: [{ id: "tool", kind: "tool", board: 0, across: 0, fromBack: 0.37, width: 0.18, height: 1.1, depth: 0.04, tool }] },
    2,
  )
  expect(shelf.items![0].tool).toEqual({ handleWidth: 0.04, bladeLength: 0.24 })
})
