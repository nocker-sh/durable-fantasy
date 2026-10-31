import { expect, it } from "vitest"
import { createSceneWater } from "#/world/scene/runtime/create-scene-water"
import { CleanupStack } from "#/lib/engine/cleanup-stack"
import { N, WATER_Y } from "#/world/scene/world"

it("keeps the plane, animated palette and cleanup order of the water surface", () => {
  const resources = new CleanupStack()
  const water = createSceneWater(resources)
  expect(water.geometry.parameters).toMatchObject({ width: N, height: N })
  expect(water.position.toArray()).toEqual([N / 2, WATER_Y, N / 2])
  expect(water.rotation.x).toBe(-Math.PI / 2)
  expect(water.material.transparent).toBe(true)
  expect(water.material.uniforms.t.value).toBe(0)
  expect(water.material.uniforms.sky.value.getHex()).toBe(0xa6c2c2)
  expect(water.material.fragmentShader).toContain("vec4(c, v > 0.78 ? 0.95 : 0.78)")
  expect(water.material.fragmentShader).toContain("#include <colorspace_fragment>")
  const events: string[] = []
  water.geometry.addEventListener("dispose", () => events.push("geometry"))
  water.material.addEventListener("dispose", () => events.push("material"))
  resources.dispose()
  expect(events).toEqual(["geometry", "material"])
})
