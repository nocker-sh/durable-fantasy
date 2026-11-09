import { expect, it } from "vitest"
import * as THREE from "three"
import { workshopContainer } from "#/world/scene/construction/workshop-container"
import { HOUSES } from "#/world/town/houses"
import { getInteriorPiece } from "#/world/town/get-interior-piece"
import { interiorPlan } from "#/world/town/interior-plan"
import { floorPlan } from "#/world/town/floorplan/floor-plan"
import { SceneResources } from "#/lib/graphics/scene-resources"

it.each([
  ["ろうの鍋", "wax-pot", 1.2, 1.2, "pot-lid"],
  ["灰汁の桶", "lye-tub", 1.05, 1.05, "removable-lid"],
  ["灰の袋", "ash-sack", 1.35, 0.9, "neck-tie"],
  ["鋳掛けの道具箱", "tinker-toolbox", 1.35, 0.75, "carry-grip"],
] as const)("restores %s with a closed storage state", (name, kind, w, d, part) => {
  const f = getInteriorPiece({ piece: { name, solid: true, on: undefined }, placement: { x: 13, z: 17, w, d } })
  expect(f).toMatchObject({ kind, name, solid: true })
  if (!("kind" in f)) throw new Error("Missing furniture renderer")
  const root = workshopContainer(f, 0.2, kind),
    box = new THREE.Box3().setFromObject(root)
  expect(root.getObjectByName(part)).toBeDefined()
  expect(box.min.y).toBeCloseTo(0.2)
  expect(box.min.x).toBeGreaterThanOrEqual(f.x - w / 2)
  expect(box.max.x).toBeLessThanOrEqual(f.x + w / 2)
  expect(box.min.z).toBeGreaterThanOrEqual(f.z - d / 2)
  expect(box.max.z).toBeLessThanOrEqual(f.z + d / 2)
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      expect(object.material).not.toBeInstanceOf(THREE.MeshBasicMaterial)
      expect(Array.from(object.geometry.getAttribute("position").array).every(Number.isFinite)).toBe(true)
    }
  })
  new SceneResources(root).dispose()
})
it("renders every furniture record in the existing house plans", () => {
  const missing = []
  for (const house of HOUSES)
    for (let floor = 0; floor < floorPlan(house.id).floors; floor++) {
      for (const piece of interiorPlan(house, floor).unrenderedFurniture) missing.push({ house: house.id, floor, name: piece.name })
    }
  expect(missing).toEqual([])
})
