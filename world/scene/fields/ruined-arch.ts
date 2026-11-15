import type * as THREE from "three"
import { Rng } from "#/lib/engine/random"
import { M } from "#/world/scene/construction/materials"
import { ruinMats } from "#/world/scene/fields/ruin-materials"
import { piece } from "#/world/scene/fields/piece"
import { stand } from "#/world/scene/fields/stand"

type Props = {
  root: THREE.Group
  x: number
  z: number
  rot: number
  seed: number
}

/**
 * A gateway of a fort from the war, standing by itself now the wall each side of it is gone: one
 * pier whole, the arch reaching out from it and stopping in the air, the other pier broken short,
 * the stones that fell lying under the gap. The way through it is still open.
 */
export function ruinedArch(props: Props) {
  const r = new Rng(props.seed)
  const here = stand(props.root, [props.x, props.z], props.rot)
  const span = 1.35
  piece({
    root: here.group,
    at: [0, 0, 0],
    build: (gb) => {
      // the whole pier with its springer, and the stub of the other
      gb.box({ side: M.ashlar, top: M.stone, x0: -span - 0.45, y0: -0.4, z0: -0.5, x1: -span + 0.45, y1: 2.5, z1: 0.5, repeat: 2 })
      gb.box({ side: M.stoneDark, top: M.stone, x0: -span - 0.55, y0: -0.4, z0: -0.6, x1: -span + 0.55, y1: 0.3, z1: 0.6, repeat: 2 })
      gb.box({ side: M.ashlar, top: ruinMats.moss, x0: span - 0.45, y0: -0.4, z0: -0.5, x1: span + 0.45, y1: 1.1 + r.next() * 0.5, z1: 0.5, repeat: 2 })
      gb.box({ side: M.stoneDark, top: M.stone, x0: span - 0.55, y0: -0.4, z0: -0.6, x1: span + 0.55, y1: 0.3, z1: 0.6, repeat: 2 })
      // what is left of the wall beyond the whole pier, stepping down into the grass
      gb.box({ side: M.stoneDark, top: ruinMats.moss, x0: -span - 1.5, y0: -0.4, z0: -0.38, x1: -span - 0.45, y1: 1.4, z1: 0.38, repeat: 2 })
      gb.box({ side: M.stoneDark, top: M.stone, x0: -span - 2.4, y0: -0.4, z0: -0.38, x1: -span - 1.5, y1: 0.6, z1: 0.38, repeat: 2 })
    },
  })
  // the arch stones, from the whole pier up and over as far as they still hold
  for (let k = 0; k < 5; k++) {
    const a = Math.PI - (k + 0.5) * 0.3
    piece({
      root: here.group,
      at: [Math.cos(a) * span, 2.5 + Math.sin(a) * span, 0],
      turn: [0, 0, a - Math.PI / 2],
      build: (gb) => gb.box({ side: M.ashlar, top: k === 4 ? ruinMats.moss : M.stone, x0: -0.24, y0: -0.3, z0: -0.48, x1: 0.24, y1: 0.3, z1: 0.48, repeat: 2, bottom: true }),
    })
  }
  // the ones that came down, tumbled under the gap
  for (let k = 0; k < 4; k++) {
    const x = span - 1.2 + r.next() * 1.5,
      z = (r.next() < 0.5 ? -1 : 1) * (0.7 + r.next() * 0.9)
    piece({
      root: here.group,
      at: [x, 0.12, z],
      turn: [(r.next() - 0.5) * 0.9, r.next() * 3, (r.next() - 0.5) * 0.9],
      build: (gb) => gb.box({ side: M.ashlar, top: r.next() < 0.5 ? ruinMats.moss : M.stone, x0: -0.24, y0: -0.2, z0: -0.4, x1: 0.24, y1: 0.28, z1: 0.4, repeat: 2 }),
    })
  }
  here.block(-span, 0, 0.6)
  here.block(-span - 1.2, 0, 0.5)
  here.block(-span - 2, 0, 0.45)
  here.block(span, 0, 0.6)
}
