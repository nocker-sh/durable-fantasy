import { expect, it } from "vitest"
import * as THREE from "three"
import { indoorLaundry } from "./indoor-laundry"
import { SceneResources } from "../../../lib/graphics/scene-resources"
import { HOUSES } from "../../town/houses"
import { interiorPlan } from "../../town/interiors"
import { updaters } from "./registry"

it("draws the washers' indoor lines with one still mesh along a wall inside each room", () => {
  const before = updaters.length
  const homes = HOUSES.filter((house) => ["fisher", "greengrocer", "fruit"].includes(house.household ?? ""))
  expect(homes).toHaveLength(3)
  for (const house of homes) {
    const room = interiorPlan(house)
    const line = room.drying!
    expect(line).toBeDefined()
    expect(line.x).toBeGreaterThan(room.x0)
    expect(line.z0).toBeGreaterThan(room.z0)
    expect(line.z1).toBeLessThan(room.z1)
    const mesh = indoorLaundry(line.z1 - line.z0, house.seed)
    expect(mesh.children).toHaveLength(0)
    expect(Array.isArray(mesh.material)).toBe(false)
    const texture = (mesh.material as THREE.MeshLambertMaterial).map as THREE.DataTexture
    const pixels = texture.image.data
    let clothPixels = 0
    for (let y = 5; y < texture.image.height; y++) for (let x = 0; x < texture.image.width; x++) if (pixels[(y * texture.image.width + x) * 4 + 3]) clothPixels++
    expect(clothPixels).toBeGreaterThan(100)
    new SceneResources(mesh).dispose()
    expect(interiorPlan(house, 1).drying).toBeUndefined()
  }
  expect(updaters.length).toBe(before)
})
