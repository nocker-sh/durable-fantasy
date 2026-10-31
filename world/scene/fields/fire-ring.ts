import type { Spot } from "#/world/scene/fields/instancing"
import * as THREE from "three"
import { rocks } from "#/world/scene/fields/rocks"
import { M } from "#/world/scene/construction/materials"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { groundH } from "#/world/scene/ground-h"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { blockCircle } from "#/world/scene/block-circle"
export function fireRing(root: THREE.Group, x: number, z: number) {
  const ring: Spot[] = []
  for (let k = 0; k < 9; k++)
    ring.push({
      x: x + Math.cos((k / 9) * Math.PI * 2) * 0.45,
      z: z + Math.sin((k / 9) * Math.PI * 2) * 0.45,
      s: 0.22,
      r: k,
    })
  rocks(root, ring, M.rockDark)
  rocks(root, [
    {
      x: x + 1.3,
      z: z + 0.3,
      s: 0.5,
      r: 1,
    },
    {
      x: x - 1.1,
      z: z + 0.8,
      s: 0.45,
      r: 2,
    },
  ])
  const gb = new GB()
  const y = groundH(x, z)
  gb.box({
    side: M.dark,
    top: null,
    x0: x - 0.25,
    y0: y,
    z0: z - 0.05,
    x1: x + 0.25,
    y1: y + 0.08,
    z1: z + 0.05,
    repeat: 1,
  })
  gb.box({
    side: M.dark,
    top: null,
    x0: x - 0.05,
    y0: y,
    z0: z - 0.22,
    x1: x + 0.05,
    y1: y + 0.07,
    z1: z + 0.22,
    repeat: 1,
  })
  gb.box({
    side: colorMat(0x6a6662),
    top: null,
    x0: x - 0.3,
    y0: y - 0.01,
    z0: z - 0.3,
    x1: x + 0.3,
    y1: y + 0.015,
    z1: z + 0.3,
    repeat: 1,
  })
  root.add(gb.build())
  blockCircle(x, z, 0.6)
}
