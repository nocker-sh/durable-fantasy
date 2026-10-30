import * as THREE from "three"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"
import { fence } from "#/world/scene/construction/fence"
import { hash2 } from "#/lib/engine/hash2"
import { groundH } from "#/world/scene/ground-h"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"
import { broadleaves } from "#/world/scene/fields/broadleaves"

type Props = {
  root: THREE.Group
  x0: number
  z0: number
  cols: number
  rows: number
}

export function orchard(props: Props) {
  // Otto's orchard: apple, pear and plum in rows, a fence round it, a ladder left against a tree
  const spots: Spot[] = []
  for (const i = { value: 0 }; i.value < props.cols; i.value++)
    for (const j = { value: 0 }; j.value < props.rows; j.value++)
      spots.push({ x: props.x0 + 0.8 + i.value * 1.9, z: props.z0 + 0.8 + j.value * 1.9, s: 0.7 + hash2(i.value, j.value, 3) * 0.15, r: i.value * 1.7 + j.value })
  broadleaves(props.root, spots, M.leaf)
  // fruit: dots of red and yellow among the leaves
  const fruit = colorMat(0xc04a3a),
    pear = colorMat(0xc8b048)
  const fg = new THREE.SphereGeometry(0.07, 5, 4)
  instanced({
    root: props.root,
    geo: fg,
    material: fruit,
    spots: spots.filter((_, k) => k % 3 !== 2).flatMap((s) => [0, 1, 2, 3].map((k) => ({ ...s, r: s.r + k * 1.6 }))),
    place: (s) => [
      [s.x + Math.cos(s.r) * 0.55 * s.s, groundH(s.x, s.z) + 1.35 * s.s, s.z + Math.sin(s.r) * 0.55 * s.s],
      [0, 0, 0],
      [1, 1, 1],
    ],
  })
  instanced({
    root: props.root,
    geo: fg,
    material: pear,
    spots: spots.filter((_, k) => k % 3 === 2).flatMap((s) => [0, 1, 2].map((k) => ({ ...s, r: s.r + k * 2 }))),
    place: (s) => [
      [s.x + Math.cos(s.r) * 0.55 * s.s, groundH(s.x, s.z) + 1.35 * s.s, s.z + Math.sin(s.r) * 0.55 * s.s],
      [0, 0, 0],
      [1, 1, 1],
    ],
  })
  const x1 = props.x0 + props.cols * 1.9 + 0.2,
    z1 = props.z0 + props.rows * 1.9 + 0.2
  fence({
    root: props.root,
    pts: [
      [props.x0, props.z0],
      [x1, props.z0],
      [x1, z1],
      [props.x0, z1],
      [props.x0, props.z0],
    ],
    gaps: [[x1, (props.z0 + z1) / 2]],
    h: 0.6,
  })
}
