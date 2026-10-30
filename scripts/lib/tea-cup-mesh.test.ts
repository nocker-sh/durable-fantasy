import * as THREE from "three"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { dishDryingSchema } from "#/scripts/lib/dish-drying-schema"
import { getCupDefinition } from "#/scripts/lib/get-cup-definition"
import { createCup } from "#/world/scene/construction/create-cup"
import { M } from "#/world/scene/construction/materials"
it("draws the same hollow cup upright and inverted inside its measured storage envelope", () => {
  const room = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h1-2.md", import.meta.url), "utf8")),
    item = dishDryingSchema.parse(room.dish_drying).items.find((dish) => dish.kind === "cup")
  if (!item || !item.cup) throw new Error("Missing source cup")
  const bottom = item.cup.bottom_m
  const profile = getCupDefinition(item)
  if (profile instanceof Error) throw profile
  for (const inverted of [false, true]) {
    const cup = createCup({ profile, at: [0, 0, 0], inverted })
    cup.updateMatrixWorld(true)
    const bounds = new THREE.Box3().setFromObject(cup)
    for (const axis of ["x", "y", "z"] satisfies ("x" | "y" | "z")[]) expect(bounds.min[axis]).toBeGreaterThanOrEqual(-1e-8)
    expect(bounds.max.x).toBeLessThanOrEqual(item.width_m + 1e-8)
    expect(bounds.max.y).toBeLessThanOrEqual(item.height_m + 1e-8)
    expect(bounds.max.z).toBeLessThanOrEqual(item.depth_m + 1e-8)
    const ray = new THREE.Raycaster(new THREE.Vector3(profile.centre[0] + 0.005, inverted ? -0.02 : profile.height + 0.02, profile.centre[1]), new THREE.Vector3(0, inverted ? 1 : -1, 0)),
      hits = ray.intersectObject(cup, true)
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0].point.y).toBeCloseTo(inverted ? profile.height - bottom : bottom, 7)
    expect(cup.children.filter((part) => part.name === "handle")).toHaveLength(3)
    cup.traverse((part) => {
      if (part instanceof THREE.Mesh) {
        expect(part.material).toBe(M.ceramic)
        part.geometry.dispose()
      }
    })
  }
})
