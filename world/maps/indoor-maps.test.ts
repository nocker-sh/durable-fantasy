import { MAPS } from "#/world/maps"
import { SpatialFrame } from "#/lib/engine/spatial-frame"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { TILE_M } from "#/world/town/fit"
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

it("anchors both authored floors to their outdoor map with metric floor elevations", () => {
  const maps = make()
  const site = house.authored?.exterior
  if (!site) throw new Error("Missing authored site fixture")
  for (const interior of interiors) {
    const space = maps[interior.id].space
    expect(space).toBeDefined()
    if (!space) throw new Error("Missing authored map space")
    const level = proposal.floorLevels.find((level) => level.floor === interior.floor)
    if (!level) throw new Error("Missing floor fixture")
    expect(MAPS[interior.id].space).toEqual(space)
    expect(space.parentMap).toBe(house.map)
    expect(space.frame.origin[0]).toBeCloseTo(site.bounds[0] * TILE_M)
    expect(space.frame.origin[1]).toBeCloseTo(site.floorY * TILE_M + level.elevation)
    expect(space.frame.origin[2]).toBeCloseTo(site.bounds[1] * TILE_M)
    expect(space.frame.quarterTurns).toBe(site.quarterTurns)
    expect(space.planarOrigin).toEqual([interior.x0, interior.z0])
    expect(space.metresPerPlanarUnit).toBe(1 / ROOM_SCALE)
  }
})

it("places indoor windows at their measured outdoor positions in the parent space", () => {
  const maps = make()
  const site = house.authored?.exterior
  if (!site) throw new Error("Missing authored site fixture")
  const checked: string[] = []
  for (const interior of interiors) {
    const space = maps[interior.id].space
    if (!space) throw new Error("Missing authored map space")
    const frame = new SpatialFrame(space.frame)
    for (const window of interior.windows ?? []) {
      const source = proposal.windows.find((candidate) => candidate.id === window.id)
      const outside = site.windows.find((candidate) => candidate.id === window.id)
      if (!source || !outside) throw new Error("Missing matched window fixture")
      const point = frame.toWorld([(window.point[0] - space.planarOrigin[0]) * space.metresPerPlanarUnit, source.sill, (window.point[1] - space.planarOrigin[1]) * space.metresPerPlanarUnit])
      expect(point[0]).toBeCloseTo(outside.point[0] * TILE_M)
      expect(point[1]).toBeCloseTo((site.floorY + outside.sill) * TILE_M)
      expect(point[2]).toBeCloseTo(outside.point[1] * TILE_M)
      checked.push(window.id)
    }
  }
  expect(checked).toHaveLength(proposal.windows.length)
})
