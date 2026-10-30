import { getCameraFacingBounds } from "#/lib/graphics/get-camera-facing-bounds"
import * as THREE from "three"
import { INDOOR } from "#/world/maps/layouts/indoor"
import { setLayout } from "#/world/scene/set-layout"
import { resetRegistries } from "#/world/scene/construction/reset-registries"
import { critters } from "#/world/scene/critters"
import type { Build } from "#/dev/three-view"
import { AT } from "#/dev/three-view"

export function stage(build: Build, night: boolean) {
  setLayout(INDOOR)
  resetRegistries()
  critters.length = 0
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(night ? 0x141a2c : 0x9ec4d8)
  const root = new THREE.Group()
  scene.add(root)
  build(root, AT, AT)
  const box = getCameraFacingBounds(root)
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshLambertMaterial({ color: night ? 0x2a3326 : 0x6a7e4c }))
  ground.rotation.x = -Math.PI / 2
  ground.position.set(AT, Math.min(0, box.isEmpty() ? 0 : box.min.y), AT)
  ground.receiveShadow = true
  scene.add(ground)
  scene.add(new THREE.HemisphereLight(night ? 0x5a6a9a : 0xfff0d8, night ? 0x10121c : 0x48405a, night ? 0.5 : 1.4))
  const sun = new THREE.DirectionalLight(night ? 0x8aa0d8 : 0xffe0b0, night ? 0.6 : 2.4)
  sun.position.set(AT + 16, 20, AT + 20)
  sun.target.position.set(AT, 0, AT)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, far: 60 })
  scene.add(sun, sun.target)
  const size = box.isEmpty() ? new THREE.Vector3(1, 1, 1) : box.getSize(new THREE.Vector3())
  const centre = box.isEmpty() ? new THREE.Vector3(AT, 0.5, AT) : box.getCenter(new THREE.Vector3())
  return { scene, centre, size }
}
