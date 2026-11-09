import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { hash2 } from "#/lib/engine/hash2"
import { groundH } from "#/world/scene/ground-h"
import { blockCircle } from "#/world/scene/block-circle"
import { M } from "#/world/scene/construction/materials"

/**
 * A barrel, never quite like the one beside it (from where it stands): taller or squatter, staves
 * new or weathered dark, two or three iron hoops or rope ones, a lid on, off (dark inside) or
 * weighted with a stone.
 */
type Props = {
  gb: GB
  x: number
  z: number
  h?: number
  r?: number
  y?: number
}

export function barrel(props: Props) {
  const baseHeight = props.h === undefined ? 0.7 : props.h
  const r = props.r === undefined ? 0.28 : props.r

  const y0 = props.y ?? groundH(props.x, props.z)
  const v = hash2(Math.round(props.x * 10), Math.round(props.z * 10), 31),
    w = hash2(Math.round(props.x * 10), Math.round(props.z * 10), 32)
  const h = baseHeight * (0.88 + v * 0.24)
  const staves = w > 0.6 ? M.woodDark : M.woodV
  const lid = v > 0.8 ? M.dark : M.wood
  props.gb.cyl({ side: staves, top: lid, centerX: props.x, centerZ: props.z, fromY: y0, toY: y0 + h * 0.5, fromRadius: r * 0.88, toRadius: r, segments: 10, repeat: 2 })
  props.gb.cyl({ side: staves, top: lid, centerX: props.x, centerZ: props.z, fromY: y0 + h * 0.5, toY: y0 + h, fromRadius: r, toRadius: r * 0.88, segments: 10, repeat: 2 })
  const hoops = w < 0.25 ? [0.15, 0.85] : [0.12, 0.5, 0.88]
  const band = w > 0.88 ? M.rope : M.iron
  for (const hh of hoops) {
    const rr = hh === 0.5 ? r + 0.01 : r * 0.9 + 0.01
    props.gb.cyl({ side: band, top: null, centerX: props.x, centerZ: props.z, fromY: y0 + h * hh - 0.025, toY: y0 + h * hh + 0.025, fromRadius: rr, toRadius: rr, segments: 10, repeat: 1 })
  }
  if (v < 0.15) props.gb.box({ side: M.stoneDark, top: M.stone, x0: props.x - 0.08, y0: y0 + h, z0: props.z - 0.07, x1: props.x + 0.09, y1: y0 + h + 0.1, z1: props.z + 0.08, repeat: 2 }) // a stone on the lid
  blockCircle(props.x, props.z, r + 0.05)
}
