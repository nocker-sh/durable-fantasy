import { afterEach, expect, it, vi } from "vitest"
import { BufferGeometry, DirectionalLight, HemisphereLight, Material, Mesh, Texture, Vector3 } from "three"
import { createSceneEnvironment } from "#/world/scene/runtime/create-scene-environment"
import { createSceneRoot } from "#/world/scene/runtime/create-scene-root"
import { CleanupStack } from "#/lib/engine/cleanup-stack"
import { withCleanup } from "#/lib/engine/with-cleanup"
import { chimneys } from "#/world/scene/construction/registry"

afterEach(() => {
  chimneys.length = 0
  vi.restoreAllMocks()
})

it.each([0, 3])("preserves light and smoke root order for %s chimneys and shares one puff texture", (count) => {
  const resources = new CleanupStack()
  const scene = createSceneRoot(resources)
  for (const index of Array.from({ length: count }, (_, index) => index)) chimneys.push(new Vector3(index, 2, 3))
  const environment = createSceneEnvironment(scene, resources)
  expect(environment.hemi).toBeInstanceOf(HemisphereLight)
  expect(environment.sun).toBeInstanceOf(DirectionalLight)
  expect(environment.hemi.color.getHex()).toBe(0xfff0d8)
  expect(environment.hemi.groundColor.getHex()).toBe(0x48405a)
  expect(environment.hemi.intensity).toBe(1.4)
  expect(scene.children).toEqual(count ? [environment.hemi, environment.sun, environment.sun.target, environment.smoke.mesh] : [environment.hemi, environment.sun, environment.sun.target])
  expect(environment.smoke.count).toBe(count * 7)
  expect(environment.puffs).toHaveLength(count * 7)
  expect(environment.smoke.mesh.geometry.instanceCount).toBe(count * 7)
  const texture = environment.smoke.mesh.material.uniforms.map.value
  expect(texture.image.width).toBe(12)
  expect(texture.flipY).toBe(true)
  const events: string[] = []
  const material = vi.spyOn(environment.smoke.mesh.material, "dispose").mockImplementation(() => {
    events.push("material")
  })
  const geometry = vi.spyOn(environment.smoke.mesh.geometry, "dispose").mockImplementation(() => {
    events.push("geometry")
  })
  const pixel = vi.spyOn(texture, "dispose").mockImplementation(() => {
    events.push("texture")
  })
  const shadow = vi.spyOn(environment.sun.shadow, "dispose").mockImplementation(() => {
    events.push("shadow")
  })
  resources.dispose()
  resources.dispose()
  expect(events).toEqual(["material", "geometry", "texture", "shadow"])
  for (const dispose of [material, geometry, pixel, shadow]) expect(dispose).toHaveBeenCalledOnce()
})

it.each(["sun", "smoke"])("recovers acquired resources if attaching %s fails", async (failedStage) => {
  const geometries = vi.spyOn(BufferGeometry.prototype, "dispose")
  const materials = vi.spyOn(Material.prototype, "dispose")
  const textures = vi.spyOn(Texture.prototype, "dispose")
  const shadows = vi.fn()
  chimneys.push(new Vector3(1, 2, 3))
  const failure = Error("environment attachment failed")
  await expect(
    withCleanup(async (resources) => {
      const scene = createSceneRoot(resources)
      const add = scene.add.bind(scene)
      vi.spyOn(scene, "add").mockImplementation((...objects) => {
        if (objects.length === 1 && objects[0] instanceof DirectionalLight) {
          vi.spyOn(objects[0].shadow, "dispose").mockImplementation(shadows)
          if (failedStage === "sun") throw failure
        }
        if (objects[0] instanceof Mesh && failedStage === "smoke") throw failure
        return add(...objects)
      })
      return createSceneEnvironment(scene, resources)
    }),
  ).rejects.toBe(failure)
  expect(shadows).toHaveBeenCalledOnce()
  expect(geometries).toHaveBeenCalledTimes(failedStage === "smoke" ? 1 : 0)
  expect(materials).toHaveBeenCalledTimes(failedStage === "smoke" ? 1 : 0)
  expect(textures).toHaveBeenCalledTimes(failedStage === "smoke" ? 1 : 0)
})
