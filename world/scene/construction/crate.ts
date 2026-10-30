import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { hash2 } from "#/lib/engine/hash2"
import { groundH } from "#/world/scene/ground-h"
import { blockCircle } from "#/world/scene/block-circle"
import { M } from "#/world/scene/construction/materials"

/**
 * A crate, each its own: a little bigger or smaller, slats across its sides, new wood or old, the
 * lid on or gone (dark inside), now and then a corner broken in.
 */
type Props = {
  gb: GB
  x: number
  z: number
  s?: number
  y?: number
  rot?: number
}

export function crate(props: Props) {
  const baseSize = props.s === undefined ? 0.5 : props.s
  const rot = props.rot === undefined ? 0 : props.rot

  const y0 = props.y ?? groundH(props.x, props.z)
  const v = hash2(Math.round(props.x * 10), Math.round(props.z * 10), 41),
    w = hash2(Math.round(props.x * 10), Math.round(props.z * 10), 42)
  const s = baseSize * (0.9 + v * 0.2)
  const hgt = s * (0.7 + w * 0.2)
  const side = w > 0.55 ? M.woodDark : M.wood
  props.gb.box({ side: side, top: v > 0.75 ? M.dark : M.wood, x0: props.x - s / 2, y0: y0, z0: props.z - s / 2, x1: props.x + s / 2, y1: y0 + hgt, z1: props.z + s / 2, repeat: 2 })
  // slats across the sides
  for (const t of [0.25, 0.75])
    props.gb.box({
      side: M.woodV,
      top: null,
      x0: props.x - s / 2 - 0.012,
      y0: y0 + hgt * t - 0.025,
      z0: props.z - s / 2 - 0.012,
      x1: props.x + s / 2 + 0.012,
      y1: y0 + hgt * t + 0.025,
      z1: props.z + s / 2 + 0.012,
      repeat: 2,
    })
  if (w < 0.12)
    props.gb.box({
      side: M.dark,
      top: null,
      x0: props.x + s / 2 - 0.13,
      y0: y0 + hgt - 0.12,
      z0: props.z + s / 2 - 0.01,
      x1: props.x + s / 2 + 0.005,
      y1: y0 + hgt + 0.005,
      z1: props.z + s / 2 + 0.005,
      repeat: 2,
    }) // a broken corner
  void rot
  blockCircle(props.x, props.z, s * 0.6)
  return y0 + hgt
}
