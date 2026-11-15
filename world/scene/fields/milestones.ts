import type * as THREE from "three"
import { hash2 } from "#/lib/engine/hash2"
import { M } from "#/world/scene/construction/materials"
import { LAYOUTS } from "#/world/maps/ground-layouts"
import { groundH } from "#/world/scene/ground-h"
import { isFree } from "#/world/scene/is-free"
import { roadD } from "#/world/scene/road-d"
import { ruinMats } from "#/world/scene/fields/ruin-materials"
import { piece } from "#/world/scene/fields/piece"

/**
 * The stones that marked the distance along a map's first road when the roads were still kept:
 * one every few dozen steps on alternate sides, some leaning, every third one down in the grass.
 * Low things at the road's edge, drawn only.
 */
export function milestones(root: THREE.Group, map: string) {
  const pts = LAYOUTS[map]?.roads[0]?.pts
  if (!pts) return
  for (let k = 6, n = 0; k < pts.length - 6; k += 8, n++) {
    const dx = pts[k + 1][0] - pts[k][0],
      dz = pts[k + 1][1] - pts[k][1]
    const len = Math.hypot(dx, dz) || 1
    const side = n % 2 ? 1 : -1
    const x = pts[k][0] - (dz / len) * 1.25 * side,
      z = pts[k][1] + (dx / len) * 1.25 * side
    if (roadD(x, z) < 0.45 || !isFree(x, z)) continue
    const down = n % 3 === 2
    const lean = (hash2(k, 1, 131) - 0.5) * 0.4
    piece({
      root: root,
      at: [x, groundH(x, z) + (down ? 0.1 : -0.2), z],
      turn: down ? [Math.PI / 2 - 0.1, k * 0.7, 0] : [lean, k * 0.7, (hash2(k, 2, 131) - 0.5) * 0.3],
      build: (gb) => {
        gb.box({ side: M.ashlar, top: hash2(k, 3, 131) < 0.5 ? ruinMats.moss : M.stone, x0: -0.17, y0: 0, z0: -0.11, x1: 0.17, y1: 0.85, z1: 0.11, repeat: 2, bottom: true })
        // the band the distance was cut on, worn away
        gb.box({ side: M.stoneDark, top: null, x0: -0.18, y0: 0.55, z0: -0.12, x1: 0.18, y1: 0.66, z1: 0.12, repeat: 1 })
      },
    })
  }
}
