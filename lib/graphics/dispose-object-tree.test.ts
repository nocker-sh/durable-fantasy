import { expect, it, vi } from "vitest"
import * as THREE from "three"
import { disposeObjectTree } from "#/lib/graphics/dispose-object-tree"
import { CleanupStack } from "#/lib/engine/cleanup-stack"
import { withCleanup } from "#/lib/engine/with-cleanup"
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
it("visits nested lines, points, sprites and material arrays in release order", () => {
  const root = new THREE.Group()
  const nested = new THREE.Group()
  const geometry = new THREE.BufferGeometry()
  const texture = new THREE.Texture()
  const lineMaterial = new THREE.LineBasicMaterial()
  const pointsMaterial = new THREE.PointsMaterial({ map: texture })
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
  const shader = new THREE.ShaderMaterial({ uniforms: { layers: { value: [[texture], texture] } } })
  const sprite = new THREE.Sprite(spriteMaterial)
  nested.add(new THREE.Line(geometry, lineMaterial), new THREE.Points(geometry, pointsMaterial), sprite)
  root.add(nested, new THREE.Mesh(geometry, [shader, lineMaterial]))
  const released: unknown[] = []
  disposeObjectTree(root, (asset) => released.push(asset))
  expect(released).toEqual([geometry, lineMaterial, texture, pointsMaterial, sprite.geometry, spriteMaterial, shader])
  expect(root.children).toEqual([nested, root.children[1]])
})
it("retains every release failure while still releasing later assets", () => {
  const geometry = new THREE.BufferGeometry()
  const material = new THREE.MeshBasicMaterial()
  const light = new THREE.PointLight()
  const root = new THREE.Group()
  root.add(new THREE.Mesh(geometry, material), light)
  const failures = [new Error("geometry failed"), new Error("material failed")]
  const released: unknown[] = []
  try {
    disposeObjectTree(root, (asset) => {
      released.push(asset)
      if (asset === geometry) throw failures[0]
      if (asset === material) throw failures[1]
    })
    expect.unreachable("cleanup must report failures")
  } catch (error) {
    expect(error).toBeInstanceOf(AggregateError)
    if (error instanceof AggregateError) expect(error.errors).toEqual(failures)
  }
  expect(released).toEqual([geometry, material, light.shadow])
})
