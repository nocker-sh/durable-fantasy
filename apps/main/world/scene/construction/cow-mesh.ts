import * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
export function cowMesh(): THREE.Group {
  const g = new THREE.Group()
  const hide = colorMat(0x8a5a3a),
    pale = colorMat(0xe6dcc6),
    horn = colorMat(0xd8ccae)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.52, 1.15), hide)
  body.position.y = 0.72
  const patch = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.3, 0.4), pale)
  patch.position.set(0, 0.8, -0.12)
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.36), pale)
  head.position.set(0, 0.86, 0.72)
  g.add(body, patch, head)
  for (const s of [-1, 1]) {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.05), horn)
    h.position.set(s * 0.22, 1.06, 0.66)
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.02), M.dark)
    e.position.set(s * 0.1, 0.92, 0.905)
    g.add(h, e)
  }
  for (const leg of [
    [-0.22, -0.42],
    [0.22, -0.42],
    [-0.22, 0.42],
    [0.22, 0.42],
  ]) {
    const x = leg[0],
      z = leg[1]
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.46, 0.11), hide)
    l.position.set(x, 0.23, z)
    g.add(l)
  }
  g.traverse((o) => {
    o.castShadow = true
  })
  return g
}
