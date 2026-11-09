import { expect, it } from "vitest"
import { MAPS } from "#/world/maps"
import { isOpen } from "#/world/maps/is-open"
import { leadsTowardTown } from "#/world/maps/leads-toward-town"

it("tells the roads back toward town from the roads further out", () => {
  expect(leadsTowardTown("deep-forest", "forest-edge")).toBe(true)
  expect(leadsTowardTown("forest-edge", "south-meadow")).toBe(true)
  expect(leadsTowardTown("red-dunes", "south-meadow")).toBe(true)
  expect(leadsTowardTown("south-meadow", "phanthiet-gate")).toBe(true)
  expect(leadsTowardTown("phanthiet-gate", "south-meadow")).toBe(false)
  expect(leadsTowardTown("south-meadow", "forest-edge")).toBe(false)
  expect(leadsTowardTown("deep-forest", "quynhon-gate")).toBe(false)
})

it("leaves every open map with a way that leads toward town, all the way to a town", () => {
  for (const map of Object.values(MAPS).filter((candidate) => candidate.kind !== "town" && isOpen(candidate.id))) {
    const route = [map.id]
    while (MAPS[route[route.length - 1]].kind !== "town") {
      const here = route[route.length - 1]
      const next = MAPS[here].warps.find((warp) => isOpen(warp.to.map) && leadsTowardTown(here, warp.to.map))
      expect(next, `${route.join(" -> ")} has no way toward town`).toBeDefined()
      if (!next) break
      route.push(next.to.map)
      expect(route.length, route.join(" -> ")).toBeLessThan(Object.keys(MAPS).length)
    }
  }
})
