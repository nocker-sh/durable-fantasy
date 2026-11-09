import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import type { Furniture } from "#/world/town/interiors"
import { rugMat, rugEdge } from "#/world/scene/interior"

export function rug(root: THREE.Group, f: Furniture, y0: number) {
  const gb = new GB()
  const xSource = f,
    x = xSource.x,
    z = xSource.z,
    w = xSource.w,
    d = xSource.d
  gb.box({ side: rugEdge, top: rugEdge, x0: x - w / 2, y0: y0, z0: z - d / 2, x1: x + w / 2, y1: y0 + 0.012, z1: z + d / 2, repeat: 2 })
  gb.box({ side: rugMat, top: rugMat, x0: x - w / 2 + 0.08, y0: y0, z0: z - d / 2 + 0.08, x1: x + w / 2 - 0.08, y1: y0 + 0.016, z1: z + d / 2 - 0.08, repeat: 2 })
  root.add(gb.build())
}
