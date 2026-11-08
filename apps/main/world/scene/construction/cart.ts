import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { heap } from "#/world/scene/heap"
import { groundH } from "#/world/scene/ground-h"
import { blockCircle } from "#/world/scene/block-circle"
import type { Goods } from "#/world/scene/construction/stalls"
import { M } from "#/world/scene/construction/materials"
import { barrel } from "#/world/scene/construction/barrel"
import { sack } from "#/world/scene/construction/sack"
import { addSprite } from "#/world/scene/construction/add-sprite"

type Props = {
  root: THREE.Group
  x: number
  z: number
  rot: number
  load: Goods | "hay" | "barrels"
}

export function cart(props: Props) {
  const g = new THREE.Group()
  const gb = new GB()
  gb.box({ side: M.wood, top: M.wood, x0: -0.6, y0: 0.5, z0: -0.9, x1: 0.6, y1: 0.62, z1: 0.9, repeat: 2 })
  for (const s of [-1, 1]) gb.box({ side: M.woodV, top: M.woodDark, x0: s * 0.6 - 0.04, y0: 0.62, z0: -0.9, x1: s * 0.6 + 0.04, y1: 0.9, z1: 0.9, repeat: 2 })
  gb.box({ side: M.woodV, top: M.woodDark, x0: -0.6, y0: 0.62, z0: 0.86, x1: 0.6, y1: 0.9, z1: 0.9, repeat: 2 })
  for (const s of [-1, 1]) gb.box({ side: M.woodDark, top: M.woodDark, x0: s * 0.25 - 0.04, y0: 0.5, z0: -2.0, x1: s * 0.25 + 0.04, y1: 0.58, z1: -0.9, repeat: 2 }) // shafts
  const wheel = (s: number) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.08, 12), M.woodDark)
    w.rotation.z = Math.PI / 2
    w.position.set(s * 0.68, 0.48, 0.1)
    w.castShadow = true
    g.add(w)
  }
  wheel(-1)
  wheel(1)
  if (props.load === "hay") {
    const hm = new THREE.Mesh(new THREE.SphereGeometry(0.75, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), M.hay)
    hm.scale.set(0.85, 0.8, 1.2)
    hm.position.y = 0.62
    hm.castShadow = true
    g.add(hm)
  } else if (props.load === "barrels") {
    barrel({ gb: gb, x: -0.28, z: -0.4, h: 0.55, r: 0.22, y: 0.62 })
    barrel({ gb: gb, x: 0.28, z: -0.4, h: 0.55, r: 0.22, y: 0.62 })
    barrel({ gb: gb, x: 0, z: 0.35, h: 0.55, r: 0.22, y: 0.62 })
  } else {
    addSprite({ root: g, b: heap({ kind: props.load, w: 70, h: 30, seed: 5 }), x: 0, y: 0.6, z: 0.0 })
    sack({ gb: gb, x: -0.3, z: 0.55, y: 0.62 })
    sack({ gb: gb, x: 0.3, z: 0.6, y: 0.62 })
  }
  g.add(gb.build())
  g.position.set(props.x, groundH(props.x, props.z) - 0.02, props.z)
  g.rotation.y = props.rot
  props.root.add(g)
  blockCircle(props.x, props.z, 1.0)
  blockCircle(props.x - Math.sin(props.rot) * 1.4, props.z - Math.cos(props.rot) * 1.4, 0.4)
}
