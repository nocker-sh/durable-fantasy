import { expect, it } from "vitest"
import { hearthToolPaths } from "#/world/town/hearth-tool"
const bounds = { x0: 0, z0: 0, x1: 1, z1: 1 },
  spec = { height: 0.7, openingBottom: 0.06, openingTop: 0.48, openingWidth: 0.4, openingOffset: 0, chamberDepth: 0.9 }
it("requires the held tool itself to reach both rear sides through the mouth", () => {
  expect(hearthToolPaths({ bounds: bounds, front: "s", spec: spec, grip: [0.5, 1.1], bladeWidth: 0.18, length: 1.1 })).toHaveLength(2)
  expect(() => hearthToolPaths({ bounds: bounds, front: "s", spec: spec, grip: [0.5, 1.1], bladeWidth: 0.18, length: 0.9 })).toThrow("cannot reach")
  expect(() => hearthToolPaths({ bounds: bounds, front: "s", spec: spec, grip: [1.2, 1.1], bladeWidth: 0.18, length: 2 })).toThrow("clips the firebox opening")
  expect(() => hearthToolPaths({ bounds: bounds, front: "s", spec: spec, grip: [0.5, 0.9], bladeWidth: 0.18, length: 2 })).toThrow("Invalid")
})
it("projects the same approach in all four directions", () => {
  for (const [side, grip] of [
    ["s", [0.5, 1.1]],
    ["n", [0.5, -0.1]],
    ["e", [1.1, 0.5]],
    ["w", [-0.1, 0.5]],
  ] as const) {
    const paths = hearthToolPaths({ bounds: bounds, front: side, spec: spec, grip: grip, bladeWidth: 0.18, length: 1.1 })
    expect(paths).toHaveLength(2)
    expect(paths.every((p) => p.target[0] >= 0 && p.target[0] <= 1 && p.target[1] >= 0 && p.target[1] <= 1)).toBe(true)
  }
})
