import { FORGE_GROUND_HALF_SIZE } from "#/world/town/workshop-footprints"
import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { groundH } from "#/world/scene/ground-h"
import { blockRect } from "#/world/scene/block-rect"
import { M, coalMat } from "#/world/scene/construction/materials"
import { fireLights, chimneys } from "#/world/scene/construction/registry"

export function forge(root: THREE.Group, x: number, z: number) {
  const gb = new GB()
  const y0 = groundH(x, z)
  gb.box({ side: M.stoneDark, top: M.stone, x0: x - 0.6, y0: y0 - 0.2, z0: z - 0.5, x1: x + 0.6, y1: y0 + 0.75, z1: z + 0.5, repeat: 4 })
  gb.box({ side: M.stone, top: M.stoneDark, x0: x - 0.45, y0: y0 + 1.6, z0: z - 0.45, x1: x + 0.45, y1: y0 + 2.0, z1: z + 0.45, repeat: 4 }) // hood
  gb.box({ side: M.stone, top: M.stone, x0: x - 0.25, y0: y0 + 2.0, z0: z - 0.25, x1: x + 0.25, y1: y0 + 3.6, z1: z + 0.25, repeat: 4 })
  gb.box({ side: M.iron, top: null, x0: x - 0.4, y0: y0 + 0.75, z0: z - 0.4, x1: x - 0.35, y1: y0 + 1.6, z1: z - 0.35, repeat: 1 })
  gb.box({ side: M.iron, top: null, x0: x + 0.35, y0: y0 + 0.75, z0: z - 0.4, x1: x + 0.4, y1: y0 + 1.6, z1: z - 0.35, repeat: 1 })
  root.add(gb.build())
  const coal = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), coalMat)
  coal.rotation.x = -Math.PI / 2
  coal.position.set(x, y0 + 0.76, z)
  root.add(coal)
  const l = new THREE.PointLight(0xff8a3a, 2.5, 6, 1.5)
  l.position.set(x, y0 + 1.1, z)
  root.add(l)
  fireLights.push({ light: l, base: 2.5, seed: x })
  chimneys.push(new THREE.Vector3(x, y0 + 3.7, z))
  blockRect({ x0: x - FORGE_GROUND_HALF_SIZE[0], z0: z - FORGE_GROUND_HALF_SIZE[1], x1: x + FORGE_GROUND_HALF_SIZE[0], z1: z + FORGE_GROUND_HALF_SIZE[1] })
}
