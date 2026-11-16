import type * as THREE from "three"
import { Rng } from "#/lib/engine/random"
import { M } from "#/world/scene/construction/materials"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"
import { ruinMats } from "#/world/scene/fields/ruin-materials"
import { piece } from "#/world/scene/fields/piece"

/**
 * A ring of standing stones from before the war, when people still asked the goddess for things
 * in the open (world.md「結晶と魔法」: 祈って女神に叶えてもらっていた). Most still stand, leaning; two
 * carry a lintel; two have fallen outwards; a flat stone lies in the middle.
 */
export function standingStones(root: THREE.Group, at: readonly [number, number], seed: number) {
  const r = new Rng(seed)
  const n = 9
  const radius = 3.3
  const fallen = [3 + (seed % 2), 7]
  const feet: [number, number, number][] = []
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + (r.next() - 0.5) * 0.12
    const x = at[0] + Math.cos(a) * radius,
      z = at[1] + Math.sin(a) * radius
    const y = groundH(x, z)
    const h = k < 2 ? 2.5 : 1.7 + r.next() * 1.3
    const mossy = r.next() < 0.5
    const stone = (len: number) => (gb: Parameters<Parameters<typeof piece>[0]["build"]>[0]) => {
      gb.box({ side: M.rock, top: mossy ? ruinMats.moss : M.rockDark, x0: -0.36, y0: 0, z0: -0.22, x1: 0.36, y1: len, z1: 0.22, repeat: 2, bottom: true })
    }
    if (fallen.includes(k)) {
      // down on its back, pointing away from the ring
      const fx = x + Math.cos(a) * 1.2,
        fz = z + Math.sin(a) * 1.2
      piece({ root: root, at: [x, groundH(fx, fz) + 0.16, z], turn: [Math.PI / 2 - 0.08, Math.PI / 2 - a, 0], build: stone(h) })
      blockCircle(x + Math.cos(a) * 0.5, z + Math.sin(a) * 0.5, 0.45)
      blockCircle(x + Math.cos(a) * 1.5, z + Math.sin(a) * 1.5, 0.45)
      continue
    }
    piece({ root: root, at: [x, y - 0.3, z], turn: [k < 2 ? 0 : (r.next() - 0.5) * 0.22, Math.PI / 2 - a, k < 2 ? 0 : (r.next() - 0.5) * 0.22], build: stone(h + 0.3) })
    feet.push([x, z, y + h])
    blockCircle(x, z, 0.42)
  }
  // the lintel on the first two
  const a = feet[0],
    b = feet[1]
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) + 0.8
  piece({
    root: root,
    at: [(a[0] + b[0]) / 2, Math.min(a[2], b[2]), (a[1] + b[1]) / 2],
    turn: [0, -Math.atan2(b[1] - a[1], b[0] - a[0]), 0.02],
    build: (gb) => gb.box({ side: M.rock, top: ruinMats.moss, x0: -len / 2, y0: 0, z0: -0.26, x1: len / 2, y1: 0.4, z1: 0.26, repeat: 2, bottom: true }),
  })
  // the flat stone in the middle
  piece({
    root: root,
    at: [at[0], groundH(at[0], at[1]) - 0.1, at[1]],
    turn: [0.03, seed, 0.02],
    build: (gb) => gb.box({ side: M.rockDark, top: M.rock, x0: -0.8, y0: 0, z0: -0.5, x1: 0.8, y1: 0.42, z1: 0.5, repeat: 2 }),
  })
  blockCircle(at[0], at[1], 0.7)
}
