import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { clay, glaze, brass, wax } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

// ---------------------------------------------------------------- the fire

/**
 * The hearth every home is built round: a stone stove with the fire's mouth at the front, a hood
 * and chimney up into the ceiling, a pot on its hook, the kettle, a shelf of things kept dry above
 * it and the day's firewood stacked beside. A fireplace is the same set into the wall.
 */
type Props = {
  k: Kit
  wd: Wood
  seed: number
  set?: boolean
}

export function hearth(props: Props) {
  const set = props.set === undefined ? false : props.set

  const WSource = props.k,
    W = WSource.W,
    D = WSource.D
  const fw = set ? W : W * 0.78
  const u0 = set ? 0 : -W / 2 + fw / 2
  props.k.box({ side: M.stoneDark, top: M.stone, u0: u0 - fw / 2, y0: 0, v0: -D / 2, u1: u0 + fw / 2, y1: 0.75, v1: D / 2, r: 2 })
  props.k.box({ side: M.stone, top: M.stone, u0: u0 - fw / 2 - 0.04, y0: 0.75, v0: -D / 2, u1: u0 + fw / 2 + 0.04, y1: 0.85, v1: D / 2 + 0.06, r: 2 }) // the ledge
  // the hood narrowing up to the chimney
  props.k.box({ side: M.plaster, top: null, u0: u0 - fw / 2 + 0.05, y0: 1.35, v0: -D / 2, u1: u0 + fw / 2 - 0.05, y1: 1.7, v1: D / 2 - 0.05 })
  props.k.box({ side: M.plaster, top: null, u0: u0 - fw * 0.28, y0: 1.7, v0: -D / 2, u1: u0 + fw * 0.28, y1: 2.5, v1: D / 2 - 0.25 })
  props.k.box({ side: M.woodDark, top: null, u0: u0 - fw / 2, y0: 1.3, v0: D / 2 - 0.1, u1: u0 + fw / 2, y1: 1.38, v1: D / 2 - 0.02 }) // the mantel beam
  // the fire's mouth, the embers and a log in it
  props.k.box({ side: M.dark, top: null, u0: u0 - fw * 0.3, y0: 0.08, v0: D / 2, u1: u0 + fw * 0.3, y1: 0.6, v1: D / 2 + 0.01 })
  props.k.box({ side: colorMat(0xff8a3a), top: null, u0: u0 - fw * 0.22, y0: 0.08, v0: D / 2 + 0.01, u1: u0 + fw * 0.22, y1: 0.2, v1: D / 2 + 0.02 })
  props.k.box({ side: M.woodDark, top: null, u0: u0 - fw * 0.2, y0: 0.18, v0: D / 2 + 0.005, u1: u0 + fw * 0.15, y1: 0.25, v1: D / 2 + 0.025 })
  // on the ledge: the kettle, a pot, a jar of salt
  props.k.cyl({ side: M.iron, top: M.dark, u: u0 - fw * 0.25, v: D / 2 - 0.2, y0: 0.85, y1: 1.0, r0: 0.1, r1: 0.08, seg: 8 })
  props.k.box({ side: M.iron, top: null, u0: u0 - fw * 0.25 + 0.08, y0: 0.93, v0: D / 2 - 0.21, u1: u0 - fw * 0.25 + 0.2, y1: 0.95, v1: D / 2 - 0.19 })
  props.k.cyl({ side: M.iron, top: M.dark, u: u0 + fw * 0.15, v: D / 2 - 0.25, y0: 0.85, y1: 1.05, r0: 0.15, r1: 0.16, seg: 9 })
  props.k.cyl({ side: clay, top: null, u: u0 + fw * 0.38, v: D / 2 - 0.15, y0: 0.85, y1: 0.98, r0: 0.05, r1: 0.04, seg: 6 })
  // what is kept on the mantel to stay dry
  props.k.cyl({ side: brass, top: null, u: u0 - fw * 0.35, v: D / 2 - 0.06, y0: 1.38, y1: 1.4, r0: 0.04, r1: 0.04, seg: 6 })
  props.k.cyl({ side: wax, top: null, u: u0 - fw * 0.35, v: D / 2 - 0.06, y0: 1.4, y1: 1.55, r0: 0.015, r1: 0.015, seg: 5 })
  for (const t = { value: 0 }; t.value < 3; t.value++)
    props.k.cyl({
      side: t.value % 2 ? clay : glaze[(props.seed + t.value) % glaze.length],
      top: null,
      u: u0 - fw * 0.1 + t.value * 0.14,
      v: D / 2 - 0.06,
      y0: 1.38,
      y1: 1.48 + r(props.seed, t.value) * 0.06,
      r0: 0.04,
      r1: 0.035,
      seg: 6,
    })
  if (!set) {
    // the day's firewood, stacked beside it
    const lu = W / 2 - (W - fw) / 2
    for (const l = { value: 0 }; l.value < 4; l.value++)
      for (const t = { value: 0 }; t.value < 3; t.value++)
        props.k.box({
          side: M.woodV,
          top: M.woodDark,
          u0: lu - 0.1 + t.value * 0.07 - 0.035,
          y0: l.value * 0.07,
          v0: -D / 2 + 0.1,
          u1: lu - 0.1 + t.value * 0.07 + 0.035,
          y1: l.value * 0.07 + 0.065,
          v1: D / 2 - 0.1,
        })
  }
}
