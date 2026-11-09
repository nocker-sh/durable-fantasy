import * as THREE from "three"
import { groundH } from "#/world/scene/ground-h"
import { blockCircle } from "#/world/scene/block-circle"
import { M } from "#/world/scene/construction/materials"

type Props = {
  root: THREE.Group
  x: number
  z: number
  s?: number
}

export function haystack(props: Props) {
  const s = props.s === undefined ? 1 : props.s

  const y0 = groundH(props.x, props.z)
  const m = new THREE.Mesh(new THREE.ConeGeometry(0.9 * s, 1.8 * s, 9), M.hay)
  m.position.set(props.x, y0 + 0.85 * s, props.z)
  m.castShadow = true
  m.receiveShadow = true
  props.root.add(m)
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6), M.woodDark)
  p.position.set(props.x, y0 + 1.95 * s, props.z)
  props.root.add(p)
  blockCircle(props.x, props.z, 0.9 * s)
}
