import { expect, it } from "vitest"
import * as THREE from "three"
import template from "#/world/town/floorplan/authored/h-m5"
import { authoredFloorPlan } from "#/world/town/floorplan/authored-floor-plan"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"
import { interiorPlan } from "#/world/town/interior-plan"
import { interiorRows } from "#/world/town/interior-rows"
import { HOUSES } from "#/world/town/houses"
import { buildInterior } from "#/world/scene/build-interior"
import { cutaways } from "#/world/scene/interior"
import { INDOOR } from "#/world/maps/layouts/indoor"
import { setLayout } from "#/world/scene/set-layout"
import { groundH } from "#/world/scene/ground-h"
import { SceneResources } from "#/lib/graphics/scene-resources"

it("projects each entrance direction into a matching wall opening, walk grid and inward arrival", () => {
  for (const side of ["n", "s", "w", "e"] as const) {
    const horizontal = side === "n" || side === "s",
      width = 10,
      depth = 12
    const rows: string[][] = Array.from({ length: depth }, (_, z) => Array.from({ length: width }, (_, x) => (x === 0 || z === 0 || x === width - 1 || z === depth - 1 ? "#" : ".")))
    for (let k = 3; k <= 4; k++)
      if (horizontal) rows[side === "n" ? 0 : depth - 1][k] = "D"
      else rows[k][side === "w" ? 0 : width - 1] = "D"
    const source: AuthoredPlan = {
      ...template,
      width,
      depth,
      floors: 1,
      entrySide: side,
      entry: horizontal ? [3.5, side === "n" ? 0 : depth - 1] : [side === "w" ? 0 : width - 1, 3.5],
      entryWidth: 2,
      floorLevels: [template.floorLevels[0]],
      stairSections: [],
      windows: [],
      lamps: [],
      details: [],
      flues: [],
      activitySpots: [],
      rooms: [{ id: "test-room", name: "土間", use: "土間", floor: 0, origin: [0, 0], rows: rows.map((row) => row.join("")), furniture: [] }],
    }
    const plan = authoredFloorPlan(source),
      room = interiorPlan(
        HOUSES.find((h) => h.id === "h-m5")!,
        0,
        plan,
      ),
      grid = interiorRows(room)
    expect(grid[room.door[1]][room.door[0]], side).toBe(".")
    expect(grid[room.arrive[1]][room.arrive[0]], side).toBe(".")
    const {
      point: [x, z],
      outward: [nx, nz],
    } = room.entrance!
    expect(room.arrive).toEqual([room.door[0] - nx * 2, room.door[1] - nz * 2])
    setLayout(INDOOR)
    const root = new THREE.Group()
    try {
      buildInterior(room)(root)
      root.updateMatrixWorld(true)
      const wall = cutaways.find((w) => w.normal[0] === nx && w.normal[1] === nz)!
      const floor = groundH(room.x0 + 1, room.z0 + 1) + 0.02
      const ray = new THREE.Raycaster(new THREE.Vector3(x - nx * 2, floor + room.doorHeight! - 0.02, z - nz * 2), new THREE.Vector3(nx, 0, nz))
      expect(ray.intersectObject(wall.obj, true), side).toHaveLength(0)
      ray.ray.origin.y = floor + room.doorHeight! + 0.02
      expect(ray.intersectObject(wall.obj, true).length, side).toBeGreaterThan(0)
    } finally {
      new SceneResources(root).dispose()
      cutaways.length = 0
    }
  }
})
