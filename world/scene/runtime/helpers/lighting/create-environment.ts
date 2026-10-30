import type { CleanupStack } from "#/lib/engine/cleanup-stack"
import * as THREE from "three"
import { BillboardBatch } from "#/lib/graphics/billboards"
import { N } from "#/world/scene/world"
import { toTexture as toTex } from "#/lib/graphics/to-texture"
import { chimneys } from "#/world/scene/construction/registry"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"

export function createEnvironment(scene: THREE.Scene, resources: CleanupStack) {
  const hemi = new THREE.HemisphereLight(0xfff0d8, 0x48405a, 1.4)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(0xffe0b0, 2.4)
  resources.use(sun.shadow)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  const sc = sun.shadow.camera as THREE.OrthographicCamera
  sc.left = -34
  sc.right = 34
  sc.top = 34
  sc.bottom = -34
  sc.near = 1
  sc.far = 120
  sun.shadow.bias = -0.0008
  scene.add(sun, sun.target)
  sun.target.position.set(N / 2, 0, N / 2)

  // ---------------------------------------------------------------- smoke
  const puffBuf = new PixBuf(12, 12)
  puffBuf.fill((x, y) => {
    const d = Math.hypot(x - 5.5, y - 5.5)
    return d < 5.5 ? (d < 3 && x < 6 && y < 6 ? [214, 206, 200] : [168, 162, 166]) : null
  })
  const puffTex = resources.use(toTex(puffBuf, false))
  const smoke = new BillboardBatch(puffTex, chimneys.length * 7)
  resources.use(smoke.mesh.geometry)
  resources.use(smoke.mesh.material)
  if (smoke.count) scene.add(smoke.mesh)
  const puffs: { age: number; life: number; o: THREE.Vector3; vx: number }[] = []
  chimneys.forEach((c, i) => {
    for (const k = { value: 0 }; k.value < 7; k.value++) {
      puffs.push({ age: (k.value / 7) * 4.5 + i, life: 4.5, o: c, vx: 0.15 + (i % 3) * 0.05 })
    }
  })

  return {
    hemi,
    sun,
    puffs,
    smoke,
  }
}
