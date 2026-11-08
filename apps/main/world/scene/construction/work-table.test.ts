import { expect, it } from "vitest"
import * as THREE from "three"
import { workTable } from "#/world/scene/construction/work-table"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { INTERIORS } from "#/world/town/interiors"
import { SceneResources } from "#/lib/graphics/scene-resources"

it("supports all six authored tables from the room floor at the designed work height", () => {
  const tables = INTERIORS.filter((room) => room.house.id === "h-m5").flatMap((room) => room.furniture.filter((f) => f.kind === "table"))
  expect(tables).toHaveLength(6)
  for (const table of tables) {
    const builder = new GB(),
      floor = 0.02
    workTable(builder, table, floor)
    const group = builder.build(),
      bounds = new THREE.Box3().setFromObject(group)
    expect(bounds.min.y).toBeCloseTo(floor)
    expect(bounds.max.y).toBeCloseTo(floor + 0.74 * 1.5)
    expect(bounds.min.x).toBeCloseTo(table.x - table.w / 2)
    expect(bounds.max.z).toBeCloseTo(table.z + table.d / 2)
    group.updateMatrixWorld(true)
    // Back faces are culled, so inspect the board's actual vertices for its lower surface.
    const levels = group.children.flatMap((child) => Array.from((child as THREE.Mesh).geometry.getAttribute("position").array).filter((_, i) => i % 3 === 1))
    expect(levels.some((y) => Math.abs(y - (floor + (0.74 - 0.04) * 1.5)) < 1e-5)).toBe(true)
    new SceneResources(group).dispose()
  }
})
