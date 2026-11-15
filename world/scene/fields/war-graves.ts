import type * as THREE from "three"
import { Rng } from "#/lib/engine/random"
import { M } from "#/world/scene/construction/materials"
import { groundH } from "#/world/scene/ground-h"
import { blockCircle } from "#/world/scene/block-circle"
import { ruinMats } from "#/world/scene/fields/ruin-materials"
import { piece } from "#/world/scene/fields/piece"
import { blooms } from "#/world/scene/fields/blooms"

/**
 * Graves from the war, in two short rows: rough stones set on end, sunk and leaning, the names
 * worn off them. Somebody still comes: there are flowers at one of them.
 */
export function warGraves(root: THREE.Group, at: readonly [number, number], seed: number) {
  const r = new Rng(seed)
  for (let k = 0; k < 9; k++) {
    const x = at[0] + (k % 5) * 1.1 - 2.2 + (r.next() - 0.5) * 0.3,
      z = at[1] + Math.floor(k / 5) * 1.5 - 0.7 + (r.next() - 0.5) * 0.3
    const h = 0.55 + r.next() * 0.5
    piece({
      root: root,
      at: [x, groundH(x, z) - 0.2, z],
      turn: [(r.next() - 0.5) * 0.4, (r.next() - 0.5) * 0.5, (r.next() - 0.5) * 0.3],
      build: (gb) => gb.box({ side: k % 3 ? M.rock : M.rockDark, top: r.next() < 0.5 ? ruinMats.moss : M.rockDark, x0: -0.24, y0: 0, z0: -0.09, x1: 0.24, y1: h + 0.2, z1: 0.09, repeat: 2 }),
    })
    blockCircle(x, z, 0.26)
    if (k === 3) blooms(root, "daisy", [{ x: x, z: z + 0.45, s: 0.8, r: 0.4 }])
    if (k === 3) blooms(root, "poppy", [{ x: x + 0.25, z: z + 0.5, s: 0.7, r: 1.4 }])
  }
}
