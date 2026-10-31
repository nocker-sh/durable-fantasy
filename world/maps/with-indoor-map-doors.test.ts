import { expect, it } from "vitest"
import { withIndoorMapDoors } from "#/world/maps/with-indoor-map-doors"
import { INTERIORS } from "#/world/town/interiors"
import { outsideDoor } from "#/world/town/outside-door"
import type { MapDefinition } from "#/world/maps/types"

it("adds ground-floor street doors after existing crossings, leaving upper floors on stairs", () => {
  const lower = INTERIORS.find((room) => room.authored && room.floor === 0)
  if (!lower) throw new Error("Missing authored ground floor")
  const sameHouse = INTERIORS.filter((room) => room.house.id === lower.house.id),
    original: MapDefinition = {
      id: lower.house.map,
      name: "street",
      kind: "town",
      size: 1,
      rows: ["."],
      spawn: [0, 0],
      places: {},
      npcs: [],
      assets: { sprites: "" },
      warps: [{ at: [0, 0], to: { map: "other", at: [0, 0] } }],
    },
    before = structuredClone(original)
  const result = withIndoorMapDoors(original, sameHouse)
  expect(result.warps).toEqual([...before.warps, { at: outsideDoor(lower.house).door, to: { map: lower.id, at: lower.arrive } }])
  expect(original).toEqual(before)
})
it("does not add doors belonging to another map", () => {
  const map: MapDefinition = { id: "elsewhere", name: "street", kind: "town", size: 1, rows: ["."], spawn: [0, 0], places: {}, npcs: [], assets: { sprites: "" }, warps: [] }
  expect(withIndoorMapDoors(map, INTERIORS)).toEqual(map)
})
