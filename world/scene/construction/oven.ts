import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { groundH } from "#/world/scene/ground-h"
import { blockRect } from "#/world/scene/block-rect"
import { M, coalMat } from "#/world/scene/construction/materials"
import { fireLights, chimneys } from "#/world/scene/construction/registry"

export function oven(root: THREE.Group, x: number, z: number) {
  const y0 = groundH(x, z)
  const gb = new GB()
  gb.box({ side: M.stoneDark, top: M.stone, x0: x - 0.9, y0: y0 - 0.2, z0: z - 0.9, x1: x + 0.9, y1: y0 + 0.6, z1: z + 0.9, repeat: 4 })
  gb.box({ side: M.dark, top: null, x0: x - 0.3, y0: y0 + 0.62, z0: z + 0.85, x1: x + 0.3, y1: y0 + 1.0, z1: z + 0.96, repeat: 1 })
  root.add(gb.build())
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.85, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M.stone)
  dome.position.set(x, y0 + 0.6, z)
  dome.castShadow = true
  root.add(dome)
  const fire = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), coalMat)
  fire.position.set(x, y0 + 0.75, z + 0.97)
  root.add(fire)
  const l = new THREE.PointLight(0xff9a40, 1.6, 4, 1.5)
  l.position.set(x, y0 + 0.9, z + 1.3)
  root.add(l)
  fireLights.push({ light: l, base: 1.6, seed: z })
  chimneys.push(new THREE.Vector3(x, y0 + 1.5, z))
  blockRect({ x0: x - 1.0, z0: z - 1.0, x1: x + 1.0, z1: z + 1.0 })
}
