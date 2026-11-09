import type { V2 } from "#/world/scene/construction/registry"
import * as THREE from "three"
import { fence } from "#/world/scene/construction/fence"
export function pen(props: Readonly<{ root: THREE.Group; r: { x0: number; z0: number; x1: number; z1: number }; gate: V2; h: number }>) {
  const root = props.root,
    r = props.r,
    gate = props.gate,
    h = props.h
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
