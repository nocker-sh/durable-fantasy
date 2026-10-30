import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import type { Furniture } from "#/world/town/interiors"

import { WALL_H } from "#/world/scene/interior"

/** A stair up to the floor above, rising towards the back wall (or along it); its head goes into the dark. */
export function stair(root: THREE.Group, f: Furniture, y0: number) {
  const gb = new GB()
  const xSource = f,
    x = xSource.x,
    z = xSource.z,
    w = xSource.w,
    d = xSource.d
  const alongZ = d >= w
  const n = 9,
    run = (alongZ ? d : w) / n,
    rise = (WALL_H + 0.3) / n
  for (const k = { value: 0 }; k.value < n; k.value++) {
    // the steps climb from the front (or the west) to the back (or the east)
    const a0 = alongZ ? z + d / 2 - (k.value + 1) * run : x - w / 2 + k.value * run
    const a1 = a0 + run
    const bx0State = alongZ ? [x - w / 2, a0, x + w / 2, a1] : [a0, z - d / 2, a1, z + d / 2],
      bx0 = bx0State[0],
      bz0 = bx0State[1],
      bx1 = bx0State[2],
      bz1 = bx0State[3]
    gb.box({ side: M.wood, top: M.woodDark, x0: bx0, y0: y0 + k.value * rise, z0: bz0, x1: bx1, y1: y0 + (k.value + 1) * rise, z1: bz1, repeat: 2 })
  }
  // the open string and a handrail on the room side
  const side = alongZ ? x - w / 2 : z + d / 2
  for (const k = { value: 0 }; k.value <= n; k.value += 3) {
    const a = alongZ ? z + d / 2 - k.value * run : x - w / 2 + k.value * run
    if (alongZ) gb.box({ side: M.woodDark, top: null, x0: side - 0.03, y0: y0, z0: a - 0.03, x1: side + 0.03, y1: y0 + k.value * rise + 0.9, z1: a + 0.03, repeat: 1 })
    else gb.box({ side: M.woodDark, top: null, x0: a - 0.03, y0: y0, z0: side - 0.03, x1: a + 0.03, y1: y0 + k.value * rise + 0.9, z1: side + 0.03, repeat: 1 })
  }
  // the hole in the ceiling it climbs into, dark above the top steps
  if (alongZ) gb.box({ side: M.dark, top: null, x0: x - w / 2, y0: y0 + WALL_H - 0.02, z0: z - d / 2, x1: x + w / 2, y1: y0 + WALL_H + 0.3, z1: z - d / 2 + run * 3, repeat: 1 })
  else gb.box({ side: M.dark, top: null, x0: x + w / 2 - run * 3, y0: y0 + WALL_H - 0.02, z0: z - d / 2, x1: x + w / 2, y1: y0 + WALL_H + 0.3, z1: z + d / 2, repeat: 1 })
  root.add(gb.build())
}
