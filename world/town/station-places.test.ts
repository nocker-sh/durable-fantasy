import { expect, it } from "vitest"
import { STATION_RULES } from "#/world/core/crafting-rules"
import { INTERIORS } from "#/world/town/interiors"
import { equipmentPlace } from "#/world/town/equipment-place"
import { locateStations } from "#/world/town/locate-stations"
import { STATIONS } from "./stations"
it("keeps every current crafting rule located at its current equipment or outdoor forge", () => {
  expect(STATIONS.map((station) => station.id)).toEqual(STATION_RULES.map((rule) => rule.id))
  const workshop = INTERIORS.find((room) => room.house.id === "h-c2" && room.floor === 0)!
  for (const [id, kind] of [
    ["workshop-hearth", "hearth"],
    ["workshop-bench", "workbench"],
    ["workshop-loom", "loom"],
  ]) {
    const equipment = workshop.furniture.find((item) => item.kind === kind)!
    expect(STATIONS.find((station) => station.id === id)).toMatchObject({ map: workshop.id, cell: [Math.floor(equipment.x * 2), Math.floor(equipment.z * 2)] })
  }
  expect(STATIONS.find((station) => station.id === "craft-forge")).toMatchObject({ map: "phanthiet-craft", cell: [33, 52] })
})
it("rejects an absent building or equipment with its identity", () => {
  expect(() => equipmentPlace({ interiors: [], house: "h-c2", kind: "hearth", name: "炉" })).toThrow("Station building has no ground-floor interior: h-c2")
  const workshop = INTERIORS.find((room) => room.house.id === "h-c2" && room.floor === 0)!
  expect(() => equipmentPlace({ interiors: [{ ...workshop, furniture: [] }], house: "h-c2", kind: "hearth", name: "炉" })).toThrow("Station equipment is missing: h-c2/hearth/炉")
})
it("rejects an unlocated new rule, duplicate IDs and malformed places without changing the input", () => {
  const rule = STATION_RULES[0],
    place = { map: "room", cell: [2, 3] as const }
  expect(() => locateStations([rule], {})).toThrow(rule.id)
  expect(() => locateStations([rule, rule], { [rule.id]: place })).toThrow("Duplicate crafting station")
  for (const invalid of [
    { map: "", cell: [2, 3] as const },
    { map: "room", cell: [-1, 3] as const },
    { map: "room", cell: [NaN, 3] as const },
    { map: "room", cell: [2.5, 3] as const },
  ])
    expect(() => locateStations([rule], { [rule.id]: invalid })).toThrow("no valid place")
  const before = JSON.stringify({ rule, place })
  expect(locateStations([rule], { [rule.id]: place })).toEqual([{ ...rule, ...place }])
  expect(JSON.stringify({ rule, place })).toBe(before)
})

it("keeps the named workstation when other equipment of the same drawing kind comes first", () => {
  const workshop = INTERIORS.find((room) => room.house.id === "h-c2" && room.floor === 0)!
  const expected = equipmentPlace({ interiors: [workshop], house: "h-c2", kind: "workbench", name: "木工台" })
  const reordered = { ...workshop, furniture: [...workshop.furniture].reverse() }
  expect(equipmentPlace({ interiors: [reordered], house: "h-c2", kind: "workbench", name: "木工台" })).toEqual(expected)
  expect(() => equipmentPlace({ interiors: [{ ...workshop, furniture: workshop.furniture.filter((item) => item.name !== "木工台") }], house: "h-c2", kind: "workbench", name: "木工台" })).toThrow(
    "Station equipment is missing: h-c2/workbench/木工台",
  )
})
