import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { groundH } from "#/world/scene/ground-h"
import { blockCircle } from "#/world/scene/block-circle"
import { M } from "#/world/scene/construction/materials"
import { lamps } from "#/world/scene/construction/registry"

export function lantern(root: THREE.Group, x: number, z: number) {
  const gb = new GB()
  const y0 = groundH(x, z)
  gb.box({ side: M.woodDark, top: M.woodDark, x0: x - 0.06, y0: y0 - 0.2, z0: z - 0.06, x1: x + 0.06, y1: y0 + 2.2, z1: z + 0.06, repeat: 2 })
  gb.box({ side: M.woodDark, top: M.woodDark, x0: x - 0.06, y0: y0 + 2.1, z0: z - 0.06, x1: x + 0.5, y1: y0 + 2.18, z1: z + 0.06, repeat: 2 })
  gb.box({ side: M.iron, top: M.iron, x0: x + 0.32, y0: y0 + 1.75, z0: z - 0.1, x1: x + 0.52, y1: y0 + 1.78, z1: z + 0.1, repeat: 1 })
  root.add(gb.build())
  const gm = new THREE.MeshLambertMaterial({ color: 0x3a3020, emissive: new THREE.Color(0xffc060), emissiveIntensity: 0 })
  const g = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.16), gm)
  g.position.set(x + 0.42, y0 + 1.92, z)
  root.add(g)
  const l = new THREE.PointLight(0xffb060, 0, 5, 1.6)
  l.position.set(x + 0.42, y0 + 1.8, z)
  root.add(l)
  lamps.push({ light: l, glow: gm, x, z })
  blockCircle(x, z, 0.2)
}
