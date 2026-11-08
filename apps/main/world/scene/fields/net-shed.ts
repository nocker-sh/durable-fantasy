import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { blockRect } from "#/world/scene/block-rect"
import { groundH } from "#/world/scene/ground-h"

type Props = {
  root: THREE.Group
  x: number
  z: number
  rot: number
}

export function netShed(props: Props) {
  // Jacob's net shed: no hearth and no bed, only nets, floats and oars
  const g = new THREE.Group()
  const gb = new GB()
  gb.box({ side: M.woodV, top: M.wood, x0: -1.2, y0: -0.3, z0: -0.9, x1: 1.2, y1: 1.5, z1: 0.9, repeat: 2 })
  gb.quad({ material: M.thatch, a: [-1.4, 1.5, 1.05], b: [1.4, 1.5, 1.05], c: [1.4, 2.3, 0], d: [-1.4, 2.3, 0], repeatU: 1, repeatV: 1 })
  gb.quad({ material: M.thatch, a: [1.4, 1.5, -1.05], b: [-1.4, 1.5, -1.05], c: [-1.4, 2.3, 0], d: [1.4, 2.3, 0], repeatU: 1, repeatV: 1 })
  gb.box({ side: M.dark, top: null, x0: -0.35, y0: 0, z0: 0.9, x1: 0.35, y1: 1.2, z1: 0.94, repeat: 1 })
  g.add(gb.build())
  g.position.set(props.x, groundH(props.x, props.z), props.z)
  g.rotation.y = props.rot
  props.root.add(g)
  blockRect({ x0: props.x - 1.4, z0: props.z - 1.4, x1: props.x + 1.4, z1: props.z + 1.4 })
}
