import { INTERIOR_CLOTH as cloth } from "#/world/scene/construction/interior-cloth-materials"
import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import type { Furniture } from "#/world/town/interiors"

type Props = {
  root: THREE.Group
  f: Furniture
  y0: number
  seed: number
}

export function bolts(props: Props) {
  // cloth on the shelves of a tailor or weaver: rolled bolts in a row
  const gb = new GB()
  const xSource = props.f,
    x = xSource.x,
    z = xSource.z,
    w = xSource.w,
    d = xSource.d
  gb.box({ side: M.woodDark, top: M.wood, x0: x - w / 2, y0: props.y0, z0: z - d / 2, x1: x + w / 2, y1: props.y0 + 1.7, z1: z - d / 2 + 0.04, repeat: 2 })
  for (const b of [0.05, 0.6, 1.15]) {
    gb.box({ side: M.wood, top: M.wood, x0: x - w / 2, y0: props.y0 + b, z0: z - d / 2, x1: x + w / 2, y1: props.y0 + b + 0.05, z1: z + d / 2, repeat: 2 })
    for (const k = { value: 0 }; k.value < 4; k.value++) {
      const cx = x - w / 2 + 0.25 + k.value * ((w - 0.5) / 3)
      gb.box({
        side: cloth[(k.value + props.seed + Math.round(b * 10)) % cloth.length],
        top: null,
        x0: cx - 0.17,
        y0: props.y0 + b + 0.05,
        z0: z - d / 2 + 0.06,
        x1: cx + 0.17,
        y1: props.y0 + b + 0.36,
        z1: z + d / 2 - 0.04,
        repeat: 1,
      })
    }
  }
  props.root.add(gb.build())
}
