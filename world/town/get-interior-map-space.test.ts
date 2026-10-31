import { expect, it } from "vitest"
import { getInteriorMapSpace } from "#/world/town/get-interior-map-space"
import { INTERIORS } from "#/world/town/interiors"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"

const fixture = () => {
  const room = INTERIORS.find((room) => room.authored && room.floor === 0)
  if (!room) throw new Error("Missing authored interior fixture")
  return structuredClone(room)
}
it("does not invent placement for legacy interiors", () => {
  const room = INTERIORS.find((room) => !room.authored)
  if (!room) throw new Error("Missing legacy interior fixture")
  expect(getInteriorMapSpace(room)).toBeUndefined()
})
it.each(["parent", "site"])("leaves unknown %s placement unassigned", (invalid) => {
  const room = fixture()
  if (!room.house.authored) throw new Error("Missing authored fixture")
  const source: AuthoredPlan = room.house.authored
  if (invalid === "parent") delete source.parentMap
  else delete source.exterior
  expect(getInteriorMapSpace(room)).toBeUndefined()
})
it.each(["building", "parent", "dimensions"])("rejects an interior with mismatched %s", (invalid) => {
  const room = fixture()
  if (invalid === "building") room.house.id = "different-building"
  if (invalid === "parent") room.house.map = "different-map"
  if (invalid === "dimensions") room.x1 += 1
  expect(() => getInteriorMapSpace(room)).toThrow(/matching authored/)
})
it("owns the projected origin and preserves the source", () => {
  const room = fixture(),
    original = structuredClone(room)
  const space = getInteriorMapSpace(room)
  if (!space || !room.house.authored?.exterior) throw new Error("Missing measured map space")
  const origin = [...space.frame.origin]
  expect(room).toEqual(original)
  const bounds = room.house.authored.exterior.bounds
  room.house.authored.exterior.bounds = [bounds[0] + 1, bounds[1], bounds[2], bounds[3]]
  expect(space.frame.origin).toEqual(origin)
})
