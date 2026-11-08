import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { M } from "#/world/scene/construction/materials"
import { leafTex } from "#/world/scene/textures/leaves"
import { blockRect } from "#/world/scene/block-rect"
import { groundH } from "#/world/scene/ground-h"

type Props = {
  root: THREE.Group
  x0: number
  z0: number
  rows: number
  len: number
}

export function vineyard(props: Props) {
  // rows of hardy small grapes on posts and wire, for the brewery
  const gb = new GB()
  const vine = mat(leafTex("leaf2", 41))
  for (const j = { value: 0 }; j.value < props.rows; j.value++) {
    const z = props.z0 + j.value * 1.3
    for (const x = { value: props.x0 }; x.value <= props.x0 + props.len; x.value += 1.5) {
      const y = groundH(x.value, z)
      gb.box({ side: M.woodDark, top: null, x0: x.value - 0.04, y0: y, z0: z - 0.04, x1: x.value + 0.04, y1: y + 1.0, z1: z + 0.04, repeat: 2 })
    }
    for (const x = { value: props.x0 }; x.value < props.x0 + props.len; x.value += 0.5) {
      const y = groundH(x.value, z)
      gb.box({ side: vine, top: vine, x0: x.value, y0: y + 0.45, z0: z - 0.16, x1: x.value + 0.5, y1: y + 0.92, z1: z + 0.16, repeat: 1 })
    }
    blockRect({ x0: props.x0 - 0.1, z0: z - 0.25, x1: props.x0 + props.len + 0.1, z1: z + 0.25 })
  }
  props.root.add(gb.build())
}
