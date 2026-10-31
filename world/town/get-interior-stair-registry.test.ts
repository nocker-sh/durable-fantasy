import { expect, it } from "vitest"
import { getInteriorStairRegistry } from "#/world/town/get-interior-stair-registry"
import { INTERIORS } from "#/world/town/interiors"

it("rejects duplicate map identities before constructing stair destinations", () => {
  const room = { ...INTERIORS[0], stairSections: [] }
  expect(() => getInteriorStairRegistry([room, { ...room }])).toThrow("Duplicate indoor map")
})
it("rejects multiple maps for the same building floor", () => {
  const room = { ...INTERIORS[0], stairSections: [] }
  expect(() => getInteriorStairRegistry([room, { ...room, id: `${room.id}-duplicate` }])).toThrow("Duplicate interior floor")
})
