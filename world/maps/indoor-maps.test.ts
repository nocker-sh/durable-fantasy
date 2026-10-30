import { expect, it } from "vitest"
import proposal from "#/world/town/floorplan/authored/h-m5"
import { authoredFloorPlan } from "#/world/town/floorplan/authored-floor-plan"
import { HOUSES } from "#/world/town/houses"
import { interiorPlan } from "#/world/town/interior-plan"
import { indoorMaps } from "#/world/maps/indoor-maps"
import { cellDistance } from "#/world/maps/cell-distance"
import { walkable } from "#/world/maps/walkable"
import { findPathCells } from "#/world/test/path"
const house = HOUSES.find((h) => h.id === "h-m5")!,
  plan = authoredFloorPlan(proposal)
const interiors = [0, 1].map((floor) => interiorPlan(house, floor, plan))
const make = (rooms = interiors) => indoorMaps(rooms, { sprites: "/sprites", name: (it) => `${it.house.name} ${it.floor + 1}`, npcs: () => [] })
it("connects authored floors through reachable landings without immediate return", () => {
  const maps = make(),
    lower = maps[interiors[0].id],
    upper = maps[interiors[1].id]
  expect(lower.id).not.toBe(upper.id)
  expect(lower.warps.filter((w) => w.to.map === house.map)).toHaveLength(1)
  expect(upper.warps.filter((w) => w.to.map === house.map)).toHaveLength(0)
  for (const [from, to] of [
    [lower, upper],
    [upper, lower],
  ]) {
    const link = from.warps.find((w) => w.to.map === to.id)!
    expect(link).toBeDefined()
    expect(walkable(from, link.at)).toBe(true)
    expect(walkable(to, link.to.at)).toBe(true)
    expect(findPathCells(from, from.spawn, (c) => cellDistance(c, link.at) === 0)).toBe(true)
    expect(to.warps.every((w) => cellDistance(w.at, link.to.at) > 1)).toBe(true)
  }
  expect(findPathCells(lower, upper.warps[0].to.at, (c) => cellDistance(c, lower.warps[0].at) === 0)).toBe(true)
})
it("rejects a missing destination floor instead of producing a broken stair", () => {
  expect(() => make([interiors[0]])).toThrow("destination floor is missing")
})
it("blocks authored exterior wall cells and never opens an upstairs street door", () => {
  const maps = make()
  for (const it of interiors) {
    const map = maps[it.id]
    const cell = (x: number, z: number) => [Math.floor((it.x0 + x) * 2), Math.floor((it.z0 + z) * 2)] as const
    expect(walkable(map, cell(0.3, 5))).toBe(false)
    expect(walkable(map, cell(5, 0.3))).toBe(false)
    expect(walkable(map, cell(it.x1 - it.x0 - 0.3, 5))).toBe(false)
    expect(walkable(map, it.door)).toBe(it.floor === 0)
  }
})
