import { expect, it } from "vitest"
import * as THREE from "three"
import { ceramicVessel, type VesselPurpose } from "#/world/scene/construction/ceramic-vessel"
import { SceneResources } from "#/lib/graphics/scene-resources"
import type { Furniture } from "#/world/town/interiors"
it.each<VesselPurpose>(["tea", "oil", "glaze"])("keeps a closed %s vessel grounded within its planned footprint", (purpose) => {
  const furniture: Furniture = { kind: "tea-jar", x: 12, z: 18, w: 0.6, d: 0.9, solid: true },
    floor = 0.3
  const group = ceramicVessel(furniture, floor, purpose),
    bounds = new THREE.Box3().setFromObject(group)
  expect(bounds.min.x).toBeGreaterThanOrEqual(furniture.x - furniture.w / 2 - 1e-6)
  expect(bounds.max.x).toBeLessThanOrEqual(furniture.x + furniture.w / 2 + 1e-6)
  expect(bounds.min.z).toBeGreaterThanOrEqual(furniture.z - furniture.d / 2 - 1e-6)
  expect(bounds.max.z).toBeLessThanOrEqual(furniture.z + furniture.d / 2 + 1e-6)
  expect(bounds.min.y).toBeCloseTo(floor)
  expect(group.getObjectByName("body")).toBeDefined()
  expect(group.getObjectByName(purpose === "oil" ? "stopper" : "lid")).toBeDefined()
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) expect(Array.from(object.geometry.getAttribute("position").array).every(Number.isFinite)).toBe(true)
  })
  new SceneResources(group).dispose()
})
it("distinguishes the serving handles, narrow oil seal and wide workshop lid", () => {
  const furniture: Furniture = { kind: "tea-jar", x: 0, z: 0, w: 0.75, d: 0.75, solid: true }
  const tea = ceramicVessel(furniture, 0, "tea"),
    oil = ceramicVessel(furniture, 0, "oil"),
    glaze = ceramicVessel(furniture, 0, "glaze")
  expect(tea.getObjectByName("handle")).toBeDefined()
  expect(oil.getObjectByName("neck-tie")).toBeDefined()
  expect(oil.getObjectByName("handle")).toBeUndefined()
  const teaLid = new THREE.Box3().setFromObject(tea.getObjectByName("lid")!).getSize(new THREE.Vector3())
  const glazeLid = new THREE.Box3().setFromObject(glaze.getObjectByName("lid")!).getSize(new THREE.Vector3())
  expect(glazeLid.x).toBeGreaterThan(teaLid.x)
  for (const group of [tea, oil, glaze]) new SceneResources(group).dispose()
})
