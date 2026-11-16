import type * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import { ruinMats } from "#/world/scene/fields/ruin-materials"
import { piece } from "#/world/scene/fields/piece"
import { stand } from "#/world/scene/fields/stand"

/**
 * A lamp of the old road: an iron post on a stone foot, bent over where something struck it, the
 * lantern's cage hanging empty from the end. Nobody has lit it in living memory.
 */
export function brokenLamp(root: THREE.Group, at: readonly [number, number], rot: number) {
  const here = stand(root, at, rot)
  piece({
    root: here.group,
    at: [0, 0, 0],
    turn: [0.04, 0, -0.06],
    build: (gb) => {
      gb.box({ side: M.stoneDark, top: M.stone, x0: -0.24, y0: -0.3, z0: -0.24, x1: 0.24, y1: 0.28, z1: 0.24, repeat: 2 })
      gb.cyl({ side: ruinMats.rustDark, top: null, centerX: 0, centerZ: 0, fromY: 0.28, toY: 2.3, fromRadius: 0.08, toRadius: 0.06, segments: 6, repeat: 2 })
      gb.cyl({ side: ruinMats.rust, top: ruinMats.rust, centerX: 0, centerZ: 0, fromY: 0.28, toY: 0.5, fromRadius: 0.13, toRadius: 0.1, segments: 6, repeat: 2 })
    },
  })
  const arm = (at2: readonly [number, number, number], lean: number, len: number) =>
    piece({
      root: here.group,
      at: at2,
      turn: [0, 0, -lean],
      build: (gb) => gb.box({ side: ruinMats.rustDark, top: ruinMats.rust, x0: -0.05, y0: 0, z0: -0.05, x1: 0.05, y1: len, z1: 0.05, repeat: 1, bottom: true }),
    })
  const p0: [number, number] = [0.13, 2.28]
  arm([p0[0], p0[1], 0], 1.0, 0.85)
  const p1: [number, number] = [p0[0] + Math.sin(1.0) * 0.85, p0[1] + Math.cos(1.0) * 0.85]
  arm([p1[0], p1[1], 0], 2.4, 0.55)
  const p2: [number, number] = [p1[0] + Math.sin(2.4) * 0.55, p1[1] + Math.cos(2.4) * 0.55]
  // the cage: a cap, four bars and a foot, the glass long gone
  piece({
    root: here.group,
    at: [p2[0], p2[1], 0],
    turn: [0.1, 0.4, 0.12],
    build: (gb) => {
      gb.box({ side: ruinMats.rust, top: ruinMats.rustDark, x0: -0.17, y0: -0.08, z0: -0.17, x1: 0.17, y1: 0, z1: 0.17, repeat: 1, bottom: true })
      for (const sx of [-1, 1])
        for (const sz of [-1, 1])
          gb.box({ side: ruinMats.rustDark, top: null, x0: sx * 0.13 - 0.025, y0: -0.42, z0: sz * 0.13 - 0.025, x1: sx * 0.13 + 0.025, y1: -0.08, z1: sz * 0.13 + 0.025, repeat: 1 })
      gb.box({ side: ruinMats.rust, top: M.dark, x0: -0.15, y0: -0.48, z0: -0.15, x1: 0.15, y1: -0.42, z1: 0.15, repeat: 1, bottom: true })
    },
  })
  here.block(0, 0, 0.3)
}
