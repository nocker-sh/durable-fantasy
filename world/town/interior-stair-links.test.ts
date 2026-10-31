import { expect, it } from "vitest"
import { interiorStairLinks } from "#/world/town/interior-stair-links"
import { INTERIORS } from "#/world/town/interiors"

it("rejects duplicate map identities before constructing stair destinations", () => {
  const room = { ...INTERIORS[0], stairSections: [] }
  expect(() => interiorStairLinks([room, { ...room }])).toThrow("Duplicate indoor map")
})
it("rejects multiple maps for the same building floor", () => {
  const room = { ...INTERIORS[0], stairSections: [] }
  expect(() => interiorStairLinks([room, { ...room, id: `${room.id}-duplicate` }])).toThrow("Duplicate interior floor")
})
