import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { fireLights } from "#/world/scene/construction/registry"
import { M } from "#/world/scene/construction/materials"
import { WALL_H } from "#/world/scene/interior"

type Props = {
  root: THREE.Group
  x: number
  z: number
  y0: number
}

export function lamp(props: Props) {
  // a lamp hanging from the ceiling beam: the room's light, day and night
  const gb = new GB()
  gb.box({ side: M.rope, top: null, x0: props.x - 0.01, y0: props.y0 + 1.95, z0: props.z - 0.01, x1: props.x + 0.01, y1: props.y0 + WALL_H + 0.4, z1: props.z + 0.01, repeat: 1 })
  gb.box({ side: M.iron, top: null, x0: props.x - 0.12, y0: props.y0 + 1.8, z0: props.z - 0.12, x1: props.x + 0.12, y1: props.y0 + 1.95, z1: props.z + 0.12, repeat: 1 })
  props.root.add(gb.build())
  const glass = new THREE.MeshLambertMaterial({ color: 0xffd890, emissive: new THREE.Color(0xffb050), emissiveIntensity: 1.2 })
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.16), glass)
  m.position.set(props.x, props.y0 + 1.73, props.z)
  props.root.add(m)
  const l = new THREE.PointLight(0xffc070, 2.4, 9, 1.3)
  l.position.set(props.x, props.y0 + 1.6, props.z)
  props.root.add(l)
  fireLights.push({ light: l, base: 2.4, seed: props.x + props.z * 7 })
}
