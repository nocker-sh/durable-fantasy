import { expect, it, vi } from "vitest"
import * as THREE from "three"
import { disposeObjectTree } from "./dispose-object-tree"
import { CleanupStack } from "../engine/cleanup-stack"
import { withCleanup } from "../engine/with-cleanup"
it("releases shared geometry, material and shader-only textures once", () => {
  const scene = new THREE.Scene(),
    geometry = new THREE.BoxGeometry(),
    map = new THREE.Texture(),
    wall = new THREE.Texture()
  const material = new THREE.ShaderMaterial({ uniforms: { map: { value: map }, walls: { value: [wall, wall] } } })
  scene.add(new THREE.Mesh(geometry, material), new THREE.Mesh(geometry, material))
  const spies = [geometry, material, map, wall].map((asset) => vi.spyOn(asset, "dispose"))
  disposeObjectTree(scene, (asset) => asset.dispose())
  for (const spy of spies) expect(spy).toHaveBeenCalledOnce()
})
it("includes light shadow render targets and keeps cleaning after an asset fails", () => {
  const scene = new THREE.Scene(),
    light = new THREE.DirectionalLight(),
    geometry = new THREE.BoxGeometry(),
    material = new THREE.MeshBasicMaterial()
  scene.add(new THREE.Mesh(geometry, material), light)
  const failure = vi.spyOn(geometry, "dispose").mockImplementation(() => {
    throw new Error("geometry")
  })
  const materialDispose = vi.spyOn(material, "dispose"),
    shadowDispose = vi.spyOn(light.shadow, "dispose")
  expect(() => disposeObjectTree(scene, (asset) => asset.dispose())).toThrow(AggregateError)
  expect(failure).toHaveBeenCalledOnce()
  expect(materialDispose).toHaveBeenCalledOnce()
  expect(shadowDispose).toHaveBeenCalledOnce()
})
it("cleans a partially built tree without double-disposing individually owned assets", async () => {
  const texture = new THREE.Texture(),
    geometry = new THREE.PlaneGeometry(),
    material = new THREE.MeshBasicMaterial({ map: texture }),
    scene = new THREE.Scene()
  const spies = [texture, geometry, material].map((asset) => vi.spyOn(asset, "dispose"))
  await expect(
    withCleanup(async (resources: CleanupStack) => {
      resources.defer(() => disposeObjectTree(scene, (asset) => resources.release(asset)))
      resources.use(texture)
      resources.use(geometry)
      resources.use(material)
      scene.add(new THREE.Mesh(geometry, material))
      throw new Error("building failed")
    }),
  ).rejects.toThrow("building failed")
  for (const spy of spies) expect(spy).toHaveBeenCalledOnce()
})
