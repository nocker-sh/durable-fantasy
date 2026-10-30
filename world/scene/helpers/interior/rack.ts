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

export function rack(props: Props) {
  const gb = new GB()
  const xSource = props.f,
    x = xSource.x,
    z = xSource.z,
    w = xSource.w,
    d = xSource.d
  for (const s of [-1, 1])
    gb.box({ side: M.woodDark, top: null, x0: x - 0.04, y0: props.y0, z0: z + s * (d / 2 - 0.04) - 0.04, x1: x + 0.04, y1: props.y0 + 1.6, z1: z + s * (d / 2 - 0.04) + 0.04, repeat: 2 })
  gb.box({ side: M.woodDark, top: null, x0: x - 0.03, y0: props.y0 + 1.55, z0: z - d / 2, x1: x + 0.03, y1: props.y0 + 1.62, z1: z + d / 2, repeat: 2 })
  for (const k = { value: 0 }; k.value < 3; k.value++) {
    const cz = z - d / 2 + 0.25 + k.value * ((d - 0.5) / 2)
    gb.box({
      side: cloth[(k.value + props.seed) % cloth.length],
      top: null,
      x0: x - w / 2 + 0.06,
      y0: props.y0 + 0.75,
      z0: cz - 0.16,
      x1: x + w / 2 - 0.06,
      y1: props.y0 + 1.52,
      z1: cz + 0.16,
      repeat: 1,
    })
  }
  props.root.add(gb.build())
}
