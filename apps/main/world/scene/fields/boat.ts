import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"

type Props = {
  root: THREE.Group
  x: number
  z: number
  rot: number
}

export function boat(props: Props) {
  const g = new THREE.Group()
  const gb = new GB()
  gb.box({ side: M.woodDark, top: M.wood, x0: -1.3, y0: 0, z0: -0.45, x1: 1.3, y1: 0.45, z1: 0.45, repeat: 2 })
  gb.box({ side: M.wood, top: null, x0: -1.25, y0: 0.45, z0: -0.5, x1: 1.25, y1: 0.52, z1: -0.42, repeat: 2 })
  gb.box({ side: M.wood, top: null, x0: -1.25, y0: 0.45, z0: 0.42, x1: 1.25, y1: 0.52, z1: 0.5, repeat: 2 })
  gb.box({ side: M.wood, top: null, x0: -0.2, y0: 0.3, z0: -0.42, x1: 0.2, y1: 0.4, z1: 0.42, repeat: 2 })
  g.add(gb.build())
  g.position.set(props.x, groundH(props.x, props.z) + 0.05, props.z)
  g.rotation.set(0, props.rot, 0.12)
  props.root.add(g)
  blockCircle(props.x, props.z, 1.2)
}
