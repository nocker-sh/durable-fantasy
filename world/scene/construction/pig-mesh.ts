import * as THREE from "three"
import { M } from "./materials"

/** Native pig construction; sheep uses the shared sheep-shape definition. */
export function pigMesh(): THREE.Group {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.7), M.pig)
  body.position.y = 0.32
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.28, 0.24), M.pig)
  head.position.set(0, 0.36, 0.44)
  // eyes only: no snout (ui.md §6.4.2)
  g.add(body, head)
  for (const position of [
    [-0.14, -0.24],
    [0.14, -0.24],
    [-0.14, 0.22],
    [0.14, 0.22],
  ]) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.18, 0.09), M.pig)
    l.position.set(position[0], 0.09, position[1])
    g.add(l)
  }
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.02), M.dark)
    e.position.set(s * 0.08, 0.42, 0.565)
    g.add(e)
  }
  g.traverse((o) => {
    o.castShadow = true
  })
  return g
}
