import { expect, it } from "vitest"
import * as THREE from "three"
import { spinningWheel } from "#/world/scene/construction/spinning-wheel"
import { SceneResources } from "#/lib/graphics/scene-resources"
import type { Furniture } from "#/world/town/interiors"
it.each([
  [0.9, 1.35],
  [1.35, 0.9],
])("keeps the working parts supported inside the %s by %s planned footprint", (w, d) => {
  const furniture: Furniture = { name: "糸車", kind: "spinning-wheel", x: 12, z: 18, w, d, solid: true },
    floor = 0.3
  const group = spinningWheel(furniture, floor),
    bounds = new THREE.Box3().setFromObject(group)
  expect(bounds.min.x).toBeGreaterThanOrEqual(furniture.x - w / 2 - 1e-6)
  expect(bounds.max.x).toBeLessThanOrEqual(furniture.x + w / 2 + 1e-6)
  expect(bounds.min.z).toBeGreaterThanOrEqual(furniture.z - d / 2 - 1e-6)
  expect(bounds.max.z).toBeLessThanOrEqual(furniture.z + d / 2 + 1e-6)
  expect(bounds.min.y).toBeCloseTo(floor)
  expect(group.getObjectByName("drive-wheel")).toBeDefined()
  expect(group.getObjectByName("yarn-bobbin")).toBeDefined()
  expect(group.getObjectByName("drive-whorl")).toBeDefined()
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      const positions = object.geometry.getAttribute("position")
      expect(Array.from(positions.array).every(Number.isFinite)).toBe(true)
    }
  })
  new SceneResources(group).dispose()
})
