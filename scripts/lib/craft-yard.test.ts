import { expect, it } from "vitest"
import { CRAFT_FORGE_PLACE, CRAFT_YARD, craftYardFootprints } from "../../world/town/craft-yard"
import { auditReservedLand } from "#/scripts/lib/audit-reserved-land"
it("reserves each occupied piece without filling the open space between equipment", () => {
  const footprints = craftYardFootprints()
  expect(footprints).toHaveLength(3)
  expect(footprints.every((piece) => piece.map === `map-${CRAFT_YARD.map}`)).toBe(true)
  expect(auditReservedLand({ id: "building-other", bounds: [15.5, 26, 17, 27], paths: [], areas: footprints, metres: 1.4 })).toContain("Footprint covers reserved land facility-craft-forge/fire")
  expect(auditReservedLand({ id: "building-other", bounds: [15.5, 28, 16.5, 29], paths: [], areas: footprints, metres: 1.4 })).toEqual([])
  expect(auditReservedLand({ id: "facility-craft-forge", bounds: [13, 24, 19, 30], paths: [], areas: footprints, metres: 1.4 })).toEqual([])
})
it("protects a passage's full width against the existing anvil and firewood", () => {
  const footprints = craftYardFootprints()
  expect(
    auditReservedLand({
      id: "building-other",
      bounds: undefined,
      paths: [
        {
          width_m: 1,
          points_tiles: [
            [18.1, 27],
            [18.1, 29],
          ],
        },
      ],
      areas: footprints,
      metres: 1.4,
    }),
  ).toContain("Access crosses reserved land facility-craft-forge/anvil")
  expect(auditReservedLand({ id: "building-other", bounds: [14, 28, 15, 29], paths: [], areas: footprints, metres: 1.4 })).toContain("Footprint covers reserved land facility-craft-forge/firewood")
  expect(CRAFT_FORGE_PLACE.cell).toEqual(CRAFT_YARD.forge.map((value) => Math.floor(value * 2)))
})
