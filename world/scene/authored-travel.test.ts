import { afterEach, expect, it } from "vitest"
import { HOUSES } from "#/world/town/houses"
import { MAPS } from "#/world/maps"
import { walkable } from "#/world/maps/walkable"
import { npcsAt } from "#/world/maps/npcs-at"
import { cellDistance } from "#/world/maps/cell-distance"
import { INTERIORS } from "#/world/town/interiors"
import { outsideDoor } from "#/world/town/outside-door"
import { roomInUse } from "#/world/town/room-in-use"
import { windowsLit } from "#/world/town/windows-lit"
import { setLayout } from "#/world/scene/set-layout"
import { initWalk } from "#/world/scene/init-walk"
import { addWalkSurfaces } from "#/world/scene/add-walk-surfaces"
import { walkH } from "#/world/scene/walk-h"
import { groundH } from "#/world/scene/ground-h"
import { MARKET, INDOOR } from "#/world/maps/ground-layouts"
const house = HOUSES.find((h) => h.id === "h-m5")!
afterEach(() => {
  setLayout(INDOOR)
  initWalk()
})
it("registers the adopted exterior and both floors with real return routes", () => {
  const rooms = INTERIORS.filter((it) => it.house === house)
  expect(rooms.map((it) => it.floor)).toEqual([0, 1])
  for (const room of rooms) {
    const map = MAPS[room.id]
    expect(walkable(map, map.spawn)).toBe(true)
    for (const warp of map.warps) expect(walkable(MAPS[warp.to.map], warp.to.at)).toBe(true)
  }
  const out = outsideDoor(house),
    site = house.authored!.exterior!
  expect((out.door[0] + 0.5) / 2).toBeCloseTo(site.door.point[0])
  expect(walkable(MAPS[house.map], out.door)).toBe(true)
})
it("places lessons and record work on usable cells of the adopted floors", () => {
  const lower = MAPS["phanthiet-in-h-m5"],
    upper = MAPS["phanthiet-in-h-m5-floor-2"]
  const classAtNight = npcsAt(lower, 21 * 60 + 30)
  expect(classAtNight).toHaveLength(9)
  expect(npcsAt(upper, 21 * 60 + 30).map((n) => n.name)).toContain("エーリヒ")
  for (const map of [lower, upper])
    for (const npc of npcsAt(map, 21 * 60 + 30)) {
      expect(walkable(map, npc.cell), npc.name).toBe(true)
      expect(
        map.warps.every((w) => cellDistance(w.at, npc.cell) > 1),
        npc.name,
      ).toBe(true)
    }
  expect(roomInUse(house, 0, 21 * 60 + 30)).toBe(true)
  expect(windowsLit(house, 21 * 60 + 30, 1)).toBe(true)
  expect(roomInUse(house, 1, 23 * 60 + 10)).toBe(false)
  expect(windowsLit(house, 12 * 60, 0)).toBe(false)
})
it("stands on the designed outdoor steps and clears their heights on rebuilding", () => {
  setLayout(MARKET)
  initWalk()
  const steps = house.authored!.exterior!.steps
  addWalkSurfaces(steps)
  for (const step of steps) {
    const x = (step.rect[0] + step.rect[2]) / 2,
      z = (step.rect[1] + step.rect[3]) / 2
    expect(walkH(x, z)).toBeCloseTo(step.height)
  }
  const step = steps[0],
    x = (step.rect[0] + step.rect[2]) / 2,
    z = (step.rect[1] + step.rect[3]) / 2
  initWalk()
  expect(walkH(x, z)).toBe(groundH(x, z))
})
