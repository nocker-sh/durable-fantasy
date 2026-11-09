import { expect, it } from "vitest"
import { hearthParts } from "#/world/town/hearth-parts"
import { scaleHearth } from "#/world/town/scale-hearth"
const spec = { height: 0.7, openingBottom: 0.06, openingTop: 0.48, openingWidth: 0.6, openingOffset: 0, chamberDepth: 0.9 }
const bounds = { x0: 0, z0: 0, x1: 1, z1: 1 },
  shaft = { x0: 0.25, z0: 0.25, x1: 0.75, z1: 0.75, wallThickness: 0.1, floorCollar: 0.15, floorSupport: { depth: 0.2, steps: 4 }, lowerFloor: 0, upperFloor: 1 }
it("joins the firebox and throat with the entire duct open in all four directions", () => {
  for (const side of ["n", "s", "e", "w"] as const) {
    const parts = hearthParts({ bounds: bounds, front: side, spec: spec, shaft: shaft, bottom: 2 })
    expect(parts.throat.bottom).toBe(parts.chamber.top)
    expect(parts.throat.top).toBe(2.7)
    for (const voidPart of [parts.chamber, parts.throat])
      for (const p of parts.masonry) {
        const overlap =
          Math.min(p.x1, voidPart.x1) > Math.max(p.x0, voidPart.x0) && Math.min(p.z1, voidPart.z1) > Math.max(p.z0, voidPart.z0) && Math.min(p.top, voidPart.top) > Math.max(p.bottom, voidPart.bottom)
        expect(overlap).toBe(false)
      }
  }
  expect(scaleHearth(spec, 2).openingTop).toBe(0.96)
  expect(() => hearthParts({ bounds: bounds, front: "s", spec: { ...spec, chamberDepth: 0.2 }, shaft: shaft, bottom: 0 })).toThrow("full flue duct")
  expect(() => hearthParts({ bounds: bounds, front: "s", spec: { ...spec, openingWidth: 2 }, shaft: shaft, bottom: 0 })).toThrow("Invalid")
})
