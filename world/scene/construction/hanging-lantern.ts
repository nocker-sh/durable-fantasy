import * as THREE from "three"
import type { LampFixture } from "#/world/town/room-fixtures"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { fireLights } from "#/world/scene/construction/registry"

type Props = {
  f: LampFixture
  floorY: number
  scale: number
  house?: string
}

export function hangingLantern(props: Props): THREE.Group {
  const root = new THREE.Group(),
    gb = new GB(),
    r = props.f.diameter / 2
  root.name = `lamp:${props.f.id}`
  gb.box({
    side: M.iron,
    top: M.iron,
    x0: props.f.x - r,
    y0: props.floorY + props.f.bottom,
    z0: props.f.z - r,
    x1: props.f.x + r,
    y1: props.floorY + props.f.bottom + props.f.diameter * 0.12,
    z1: props.f.z + r,
    repeat: 2,
  })
  gb.box({
    side: M.iron,
    top: M.iron,
    x0: props.f.x - r,
    y0: props.floorY + props.f.top - props.f.diameter * 0.12,
    z0: props.f.z - r,
    x1: props.f.x + r,
    y1: props.floorY + props.f.top,
    z1: props.f.z + r,
    repeat: 2,
  })
  for (const x of [-1, 1])
    for (const z of [-1, 1])
      gb.box({
        side: M.iron,
        top: M.iron,
        x0: props.f.x + x * r * 0.92 - r * 0.08,
        y0: props.floorY + props.f.bottom,
        z0: props.f.z + z * r * 0.92 - r * 0.08,
        x1: props.f.x + x * r * 0.92 + r * 0.08,
        y1: props.floorY + props.f.top,
        z1: props.f.z + z * r * 0.92 + r * 0.08,
        repeat: 2,
      })
  gb.box({
    side: M.iron,
    top: M.iron,
    x0: props.f.x - r * 0.05,
    y0: props.floorY + props.f.top,
    z0: props.f.z - r * 0.05,
    x1: props.f.x + r * 0.05,
    y1: props.floorY + props.f.ceiling,
    z1: props.f.z + r * 0.05,
    repeat: 2,
  })
  const glass = new THREE.MeshLambertMaterial({ color: 0xffd890, emissive: 0xffb050, emissiveIntensity: 1.2 })
  gb.box({
    side: glass,
    top: glass,
    x0: props.f.x - r * 0.7,
    y0: props.floorY + props.f.bottom + props.f.diameter * 0.12,
    z0: props.f.z - r * 0.7,
    x1: props.f.x + r * 0.7,
    y1: props.floorY + props.f.top - props.f.diameter * 0.12,
    z1: props.f.z + r * 0.7,
    repeat: 2,
  })
  root.add(gb.build())
  const light = new THREE.PointLight(0xffc070, 2.4 * props.scale * props.scale, 9 * props.scale, 1.3)
  light.position.set(props.f.x, props.floorY + (props.f.bottom + props.f.top) / 2, props.f.z)
  root.add(light)
  fireLights.push({ light, base: light.intensity, seed: props.f.x + props.f.z * 7, room: props.house ? { house: props.house, floor: props.f.floor } : undefined, glow: glass })
  return root
}
