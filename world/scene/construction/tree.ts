import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { Rng } from "#/lib/engine/random"
import { groundH } from "#/world/scene/ground-h"
import { blockCircle } from "#/world/scene/block-circle"
import { M } from "#/world/scene/construction/materials"
import { occluder } from "#/world/scene/construction/occluder"
import { animateObject } from "#/world/scene/construction/animate-object"

type Props = {
  root: THREE.Group
  x: number
  z: number
  scale?: number
  kind?: "leaf" | "leaf2" | "autumn"
  seed?: number
}

export function tree(props: Props) {
  const scale = props.scale === undefined ? 1 : props.scale
  const kind = props.kind === undefined ? "leaf" : props.kind
  const seed = props.seed === undefined ? 0 : props.seed

  const gb = new GB()
  const y0 = groundH(props.x, props.z)
  const r = new Rng(seed + 100)
  const th = 1.4 * scale
  gb.cyl({ side: M.woodDark, top: null, centerX: props.x, centerZ: props.z, fromY: y0 - 0.2, toY: y0 + th, fromRadius: 0.16 * scale, toRadius: 0.1 * scale, segments: 7, repeat: 2 })
  const g = gb.build()
  props.root.add(g)
  const leafM = M[kind]
  const crown = new THREE.Group()
  for (const i = { value: 0 }; i.value < 6; i.value++) {
    const rad = (0.7 + r.next() * 0.5) * scale
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(rad, 0), leafM)
    m.position.set((r.next() - 0.5) * 1.1 * scale, th + (r.next() * 0.9 + (i.value === 0 ? 0.6 : 0)) * scale, (r.next() - 0.5) * 1.1 * scale)
    m.rotation.set(r.next() * 3, r.next() * 3, r.next() * 3)
    m.castShadow = true
    m.receiveShadow = true
    crown.add(m)
  }
  crown.position.set(props.x, y0, props.z)
  props.root.add(crown)
  crown.updateMatrixWorld(true)
  occluder(crown, 0)
  const ph = r.next() * 6
  animateObject(crown, (t) => {
    crown.rotation.z = Math.sin(t * 0.9 + ph) * 0.012
    crown.rotation.x = Math.sin(t * 0.7 + ph) * 0.01
  })
  blockCircle(props.x, props.z, 0.35 * scale)
}
