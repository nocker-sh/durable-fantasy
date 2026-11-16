import type * as THREE from "three"
import { Rng } from "#/lib/engine/random"
import { M } from "#/world/scene/construction/materials"
import { ruinMats } from "#/world/scene/fields/ruin-materials"
import { piece } from "#/world/scene/fields/piece"
import { drum } from "#/world/scene/fields/drum"
import { stand } from "#/world/scene/fields/stand"

type Props = {
  root: THREE.Group
  x: number
  z: number
  rot: number
  seed: number
}

/**
 * A colonnade from when the goddess was here (world.md「場所」): five columns on a strip of paving,
 * one still whole with its capital, the others broken off at different heights and grown over, and
 * one lying in the grass in the drums it broke into when it came down.
 */
export function fallenColumns(props: Props) {
  const r = new Rng(props.seed)
  const here = stand(props.root, [props.x, props.z], props.rot)
  const whole = props.seed % 5
  const fell = (whole + 2) % 5
  piece({
    root: here.group,
    at: [0, 0, 0],
    build: (gb) => {
      // the paving they stand on, sunk level with the grass
      gb.box({ side: M.stoneDark, top: M.stone, x0: -3.4, y0: -0.5, z0: -0.8, x1: 3.4, y1: 0.04, z1: 0.8, repeat: 2 })
      for (let k = 0; k < 5; k++) {
        const cx = -2.6 + k * 1.3
        const h = k === whole ? 3.1 : k === fell ? 0.3 : 0.6 + r.next() * 1.7
        gb.box({ side: M.ashlar, top: M.stone, x0: cx - 0.42, y0: 0.04, z0: -0.42, x1: cx + 0.42, y1: 0.3, z1: 0.42, repeat: 2 })
        gb.cyl({
          side: M.ashlar,
          top: k === whole ? null : r.next() < 0.6 ? ruinMats.moss : M.stone,
          centerX: cx,
          centerZ: 0,
          fromY: 0.3,
          toY: 0.3 + h,
          fromRadius: 0.3,
          toRadius: 0.27,
          segments: 9,
          repeat: 2,
        })
        if (k === whole) {
          gb.box({ side: M.ashlar, top: M.stone, x0: cx - 0.36, y0: 0.3 + h, z0: -0.36, x1: cx + 0.36, y1: 0.3 + h + 0.14, z1: 0.36, repeat: 2 })
          gb.box({ side: M.ashlar, top: ruinMats.moss, x0: cx - 0.48, y0: 0.3 + h + 0.14, z0: -0.48, x1: cx + 0.48, y1: 0.3 + h + 0.34, z1: 0.48, repeat: 2 })
        } else if (k !== fell) {
          // the break is ragged: a shard of the next drum still standing on one side
          gb.cyl({ side: M.ashlar, top: M.stone, centerX: cx + 0.08, centerZ: -0.06, fromY: 0.3 + h, toY: 0.3 + h + 0.2 + r.next() * 0.3, fromRadius: 0.19, toRadius: 0.12, segments: 6, repeat: 2 })
        }
        here.block(cx, 0, 0.42)
      }
    },
  })
  // the one that fell: its drums in a line where it came down, the capital rolled a little further
  const fx = -2.6 + fell * 1.3
  for (let k = 0; k < 3; k++) {
    const z = 1.15 + k * 1.02
    drum({
      root: here.group,
      at: [fx + 0.12 * k + (r.next() - 0.5) * 0.2, 0.2, z],
      turn: [Math.PI / 2 + (r.next() - 0.5) * 0.14, (r.next() - 0.5) * 0.4, 0],
      radius: 0.29,
      radiusTop: 0.27,
      length: 0.92,
      material: M.ashlar,
    })
    here.block(fx + 0.12 * k, z, 0.4)
  }
  piece({
    root: here.group,
    at: [fx + 0.7, 0.05, 4.5],
    turn: [0.5, 0.7, 0.2],
    build: (gb) => gb.box({ side: M.ashlar, top: ruinMats.moss, x0: -0.48, y0: -0.1, z0: -0.48, x1: 0.48, y1: 0.24, z1: 0.48, repeat: 2 }),
  })
  here.block(fx + 0.7, 4.5, 0.45)
}
