import { WELL_BLOCK_RADIUS_TILES } from "#/world/town/well-dimensions"
import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { groundH } from "#/world/scene/ground-h"
import { blockCircle } from "#/world/scene/block-circle"
import { M } from "#/world/scene/construction/materials"
import { animateObject } from "#/world/scene/construction/animate-object"
import { bucket } from "#/world/scene/construction/bucket"
import { wellShaftMat } from "#/world/scene/construction/helpers/furniture/well-shaft-mat"

export function well(root: THREE.Group, x: number, z: number) {
  const gb = new GB()
  const y0 = groundH(x, z)
  gb.cyl({ side: M.stone, top: null, centerX: x, centerZ: z, fromY: y0 - 0.2, toY: y0 + 0.75, fromRadius: 0.85, toRadius: 0.85, segments: 14, repeat: 2 })
  gb.cyl({ side: M.ashlar, top: null, centerX: x, centerZ: z, fromY: y0 + 0.75, toY: y0 + 0.82, fromRadius: 0.9, toRadius: 0.9, segments: 14, repeat: 2 })
  // the mouth of the well: no water to be seen, only a hole going down — the stones of its inside
  // wall, damp and mossy near the top, fading into black
  const rim = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.9, 14, 1), M.ashlar)
  rim.rotation.x = -Math.PI / 2
  rim.position.set(x, y0 + 0.82, z)
  // (the ground is drawn inside the ring too, so the black falls away to just above it)
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.74, 14, 1, true), wellShaftMat())
  shaft.position.set(x, y0 + 0.82 - 0.37, z)
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.62, 14), new THREE.MeshBasicMaterial({ color: 0x050407 }))
  bottom.rotation.x = -Math.PI / 2
  bottom.position.set(x, y0 + 0.09, z)
  root.add(rim, shaft, bottom)
  for (const s of [-1, 1]) gb.box({ side: M.woodV, top: M.woodDark, x0: x + s * 0.78 - 0.07, y0: y0 + 0.7, z0: z - 0.07, x1: x + s * 0.78 + 0.07, y1: y0 + 2.25, z1: z + 0.07, repeat: 2 })
  gb.box({ side: M.woodDark, top: M.woodDark, x0: x - 0.85, y0: y0 + 1.45, z0: z - 0.06, x1: x + 0.85, y1: y0 + 1.57, z1: z + 0.06, repeat: 2 })
  gb.box({ side: M.rope, top: null, x0: x - 0.02, y0: y0 + 0.95, z0: z - 0.02, x1: x + 0.02, y1: y0 + 1.45, z1: z + 0.02, repeat: 2 })
  // little roof
  const yR = y0 + 2.6,
    yE = y0 + 2.1
  gb.quad({ material: M.roof2, a: [x - 1.1, yE, z + 0.75], b: [x + 1.1, yE, z + 0.75], c: [x + 1.1, yR, z], d: [x - 1.1, yR, z], repeatU: 4, repeatV: 4 })
  gb.quad({ material: M.roof2, a: [x + 1.1, yE, z - 0.75], b: [x - 1.1, yE, z - 0.75], c: [x - 1.1, yR, z], d: [x + 1.1, yR, z], repeatU: 4, repeatV: 4 })
  bucket({ gb: gb, x: x - 0.74, z: z + 0.3, y: y0 + 0.82, water: true }) // set down on the rim
  bucket({ gb: gb, x: x + 1.05, z: z + 0.55, y: undefined, water: true })
  root.add(gb.build())
  blockCircle(x, z, WELL_BLOCK_RADIUS_TILES)
  // the hanging bucket on the rope bobs a little
  const b = new GB()
  bucket({ gb: b, x: 0, z: 0, y: 0, water: true })
  const hb = b.build()
  hb.position.set(x, y0 + 0.95 - 0.24, z)
  root.add(hb)
  animateObject(hb, (t) => {
    hb.rotation.y = Math.sin(t * 0.8) * 0.3
  })
}
