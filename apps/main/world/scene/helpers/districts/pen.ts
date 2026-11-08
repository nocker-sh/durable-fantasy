import type { V2 } from "#/world/scene/construction/registry"
import * as THREE from "three"
import { fence } from "#/world/scene/construction/fence"
export function pen(
  root: THREE.Group,
  r: {
    x0: number
    z0: number
    x1: number
    z1: number
  },
  gate: V2,
  h: number,
) {
  fence({
    root: root,
    pts: [
      [r.x0, r.z0],
      [r.x1, r.z0],
      [r.x1, r.z1],
      [r.x0, r.z1],
      [r.x0, r.z0],
    ],
    gaps: [gate],
    h: h,
  })
}
