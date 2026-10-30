import type * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { clay, brass } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

// ---------------------------------------------------------------- vessels

type Props = {
  k: Kit
  wd: Wood
  seed: number
  onCradle?: boolean
  tall?: number
}

export function cask(props: Props) {
  const onCradle = props.onCradle === undefined ? false : props.onCradle
  const tall = props.tall === undefined ? 0.95 : props.tall

  const rr = onCradle ? Math.min(props.k.D * 0.34, props.k.W * 0.3) : Math.min(props.k.W, props.k.D) / 2 - 0.04
  if (onCradle) {
    // a cask on its side on a cradle, with a tap and a cup under it
    for (const sv of [-1, 1]) props.k.box({ side: props.wd.dark, top: null, u0: -props.k.W / 2 + 0.05, y0: 0, v0: sv * rr * 0.6 - 0.04, u1: props.k.W / 2 - 0.05, y1: 0.12, v1: sv * rr * 0.6 + 0.04 })
    const L = props.k.W - 0.1
    // lying on its side: an eight-sided section, fuller in the middle than at the ends
    const cy = 0.12 + rr
    const section = (inputProps: { m: THREE.Material; u0: number; u1: number; R: number }) => {
      const m = inputProps.m
      const u0 = inputProps.u0
      const u1 = inputProps.u1
      const R = inputProps.R

      props.k.box({ side: m, top: null, u0: u0, y0: cy - R * 0.4, v0: -R, u1: u1, y1: cy + R * 0.4, v1: R })
      props.k.box({ side: m, top: null, u0: u0, y0: cy - R, v0: -R * 0.4, u1: u1, y1: cy + R, v1: R * 0.4 })
      props.k.box({ side: m, top: null, u0: u0, y0: cy - R * 0.72, v0: -R * 0.72, u1: u1, y1: cy + R * 0.72, v1: R * 0.72 })
    }
    const n = 5
    for (const i = { value: 0 }; i.value < n; i.value++) {
      const t = (i.value + 0.5) / n - 0.5
      section({ m: props.wd.body, u0: -L / 2 + (i.value * L) / n, u1: -L / 2 + ((i.value + 1) * L) / n, R: rr * (1 - t * t * 0.5) })
    }
    for (const u of [-L / 2 + 0.06, L / 2 - 0.1]) section({ m: M.iron, u0: u, u1: u + 0.04, R: rr * 0.93 + 0.012 })
    props.k.box({ side: brass, top: null, u0: -L / 2 - 0.1, y0: cy - 0.15, v0: -0.02, u1: -L / 2, y1: cy - 0.11, v1: 0.02 }) // the tap, in the head
    props.k.cyl({ side: clay, top: null, u: -L / 2 - 0.08, v: 0, y0: 0, y1: 0.08, r0: 0.04, r1: 0.035, seg: 6 })
    return
  }
  const h = tall * (0.92 + r(props.seed, 1) * 0.12)
  props.k.cyl({ side: props.wd.body, top: props.wd.top, u: 0, v: 0, y0: 0, y1: h * 0.5, r0: rr * 0.88, r1: rr, seg: 10 })
  props.k.cyl({ side: props.wd.body, top: props.wd.top, u: 0, v: 0, y0: h * 0.5, y1: h, r0: rr, r1: rr * 0.88, seg: 10 })
  for (const t of [0.12, 0.5, 0.88])
    props.k.cyl({ side: M.iron, top: null, u: 0, v: 0, y0: h * t - 0.025, y1: h * t + 0.025, r0: rr * (t === 0.5 ? 1 : 0.9) + 0.012, r1: rr * (t === 0.5 ? 1 : 0.9) + 0.012, seg: 10 })
}
