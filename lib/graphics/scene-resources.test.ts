import { expect, it, vi } from "vitest"
import * as THREE from "three"
import { SceneResources } from "./scene-resources"

it("releases shared resources once, including detached objects and shadow targets", () => {
  const scene = new THREE.Scene()
  const geometry = new THREE.BoxGeometry()
  const texture = new THREE.Texture()
  const material = new THREE.MeshStandardMaterial({ map: texture, emissiveMap: texture })
  const first = new THREE.Mesh(geometry, [material, material])
  scene.add(first, new THREE.Mesh(geometry, material))
  const light = new THREE.DirectionalLight()
  scene.add(light)
  const checks = [vi.spyOn(geometry, "dispose"), vi.spyOn(material, "dispose"), vi.spyOn(texture, "dispose"), vi.spyOn(light.shadow, "dispose")]
  const resources = new SceneResources(scene)
  first.removeFromParent()
  resources.dispose()
  resources.dispose()
  for (const check of checks) expect(check).toHaveBeenCalledOnce()
})

it("releases shader uniform and environment textures without requiring mesh material slots", () => {
  const scene = new THREE.Scene()
  const texture = new THREE.Texture()
  const other = new THREE.Texture()
  const material = new THREE.ShaderMaterial({ uniforms: { image: { value: texture }, images: { value: [texture, other] } } })
  scene.background = texture
  scene.environment = other
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(), material))
  const checks = [vi.spyOn(texture, "dispose"), vi.spyOn(other, "dispose")]
  new SceneResources(scene).dispose()
  for (const check of checks) expect(check).toHaveBeenCalledOnce()
})
