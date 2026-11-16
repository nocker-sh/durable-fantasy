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

const W = 2.6 // half its length
const D = 1.9 // half its depth

/**
 * A farmstead nobody came back to: the walls standing to different heights with the door and a
 * window still to be made out, one gable up to its point, the hearth and its chimney, and the roof
 * timbers lying where they fell inside. Open to the sky, grass on the floor; one can walk in.
 */
export function ruinedHouse(props: Props) {
  const r = new Rng(props.seed)
  const here = stand(props.root, [props.x, props.z], props.rot)
  piece({
    root: here.group,
    at: [0, 0, 0],
    build: (gb) => {
      const wall = (x: number, z: number, h: number, alongX: boolean) => {
        const hx = alongX ? 0.36 : 0.24,
          hz = alongX ? 0.24 : 0.36
        gb.box({ side: M.stone, top: r.next() < 0.45 ? ruinMats.moss : M.stoneDark, x0: x - hx, y0: -0.4, z0: z - hz, x1: x + hx, y1: h, z1: z + hz, repeat: 2 })
        here.block(x, z, 0.36)
      }
      // the long walls: the door in the front one, a window in the back
      for (let k = 0; k <= 7; k++) {
        const x = -W + (k * 2 * W) / 7
        const edge = Math.min(k, 7 - k)
        if (k !== 4) wall(x, D, k === 3 || k === 5 ? 1.9 : 0.5 + r.next() * 1.2 + (edge === 0 ? 0.9 : 0), true)
        wall(x, -D, k === 2 ? 0.8 : 1.0 + r.next() * 1.3 + (edge === 0 ? 0.6 : 0), true)
      }
      // the gable at one end, stepping up to where the ridge was; the other end fallen low
      for (let k = 1; k <= 4; k++) {
        const z = -D + (k * 2 * D) / 5
        wall(-W, z, 2.1 + (2.5 - Math.abs(k - 2.5)) * 0.7, false)
        wall(W, z, 0.35 + r.next() * 0.7, false)
      }
      // the hearth against the gable and its chimney, the last thing still whole
      gb.box({ side: M.stoneDark, top: M.stone, x0: -W + 0.24, y0: -0.2, z0: -0.7, x1: -W + 0.95, y1: 1.0, z1: 0.7, repeat: 2 })
      gb.box({ side: M.dark, top: null, x0: -W + 0.9, y0: 0.05, z0: -0.4, x1: -W + 0.97, y1: 0.7, z1: 0.4, repeat: 1 })
      gb.box({ side: M.stoneDark, top: M.dark, x0: -W + 0.24, y0: 1.0, z0: -0.36, x1: -W + 0.8, y1: 4.2, z1: 0.36, repeat: 2 })
      // flagstones showing through the grass
      gb.box({ side: M.stoneDark, top: M.stone, x0: -W + 1.0, y0: -0.3, z0: -1.0, x1: 0.2, y1: 0.03, z1: 0.9, repeat: 2 })
    },
  })
  // the roof timbers where they came down: one still leaning in the gable, the others across the floor
  const beam = (at: readonly [number, number, number], turn: readonly [number, number, number], len: number) =>
    piece({
      root: here.group,
      at: at,
      turn: turn,
      build: (gb) => gb.box({ side: ruinMats.greyWood, top: ruinMats.greyWood, x0: -len / 2, y0: -0.09, z0: -0.09, x1: len / 2, y1: 0.09, z1: 0.09, repeat: 1, bottom: true }),
    })
  beam([-W + 1.5, 1.5, 0.3], [0, 0.15, 0.62], 4.2)
  beam([0.6, 0.14, -0.6], [0, 0.9, 0.04], 3.0)
  beam([1.2, 0.2, 0.7], [0, -0.5, -0.07], 2.6)
  beam([0.2, 0.1, 2.6], [0, 0.2, 0], 1.8)
}
