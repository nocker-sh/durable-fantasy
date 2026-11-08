import * as THREE from "three"
import type { V2 } from "#/world/scene/construction/registry"
import { groundH } from "#/world/scene/ground-h"

// ---------------------------------------------------------------- instanced props
type Spot = { x: number; z: number; s: number; r: number }

const m4 = new THREE.Matrix4(),
  q = new THREE.Quaternion(),
  e = new THREE.Euler(),
  v = new THREE.Vector3(),
  sc = new THREE.Vector3()

function instanced(inputProps: {
  root: THREE.Group
  geo: THREE.BufferGeometry
  material: THREE.Material
  spots: Spot[]
  place: (s: Spot) => [V2 | [number, number, number], [number, number, number], [number, number, number]]
}) {
  const root = inputProps.root
  const geo = inputProps.geo
  const material = inputProps.material
  const spots = inputProps.spots
  const place = inputProps.place

  if (!spots.length) return
  const im = new THREE.InstancedMesh(geo, material, spots.length)
  spots.forEach((s, i) => {
    const pState = place(s),
      p = pState[0],
      rot = pState[1],
      scale = pState[2]
    v.set(p[0], p.length === 3 ? p[1] : groundH(p[0], p[1]), p.length === 3 ? p[2] : p[1])
    q.setFromEuler(e.set(rot[0], rot[1], rot[2]))
    m4.compose(v, q, sc.set(scale[0], scale[1], scale[2]))
    im.setMatrixAt(i, m4)
  })
  im.castShadow = true
  im.receiveShadow = true
  root.add(im)
}

export { type Spot, instanced }
