import { subtractRectangles } from "#/lib/engine/rectangle-subtraction"
import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { WALL_H } from "#/world/scene/interior"

type Props = {
  root: THREE.Group
  x0: number
  z0: number
  x1: number
  z1: number
  y0: number
  holes?: [number, number][]
  height?: number
  openingHeight?: number
  apertures?: readonly { from: number; to: number; bottom: number; top: number }[]
}

export function wall(props: Props) {
  const holes = props.holes === undefined ? [] : props.holes
  const height = props.height === undefined ? WALL_H : props.height
  const openingHeight = props.openingHeight === undefined ? 1.75 : props.openingHeight
  const apertures = props.apertures === undefined ? [] : props.apertures

  // a plaster wall on a wooden skirting, with a beam along the top; `holes` are gaps along its length
  const g = new THREE.Group()
  const gb = new GB()
  const alongX = props.x1 - props.x0 > props.z1 - props.z0
  const a0 = alongX ? props.x0 : props.z0,
    a1 = alongX ? props.x1 : props.z1
  const cuts = [...holes].sort((p, q) => p[0] - q[0])
  const at = { value: a0 }
  const piece = (s: number, e: number) => {
    if (e - s < 0.01) return
    const bx0State = alongX ? [s, props.z0, e, props.z1] : [props.x0, s, props.x1, e],
      bx0 = bx0State[0],
      bz0 = bx0State[1],
      bx1 = bx0State[2],
      bz1 = bx0State[3]
    gb.box({ side: M.plaster, top: M.woodDark, x0: bx0, y0: props.y0, z0: bz0, x1: bx1, y1: props.y0 + height, z1: bz1, repeat: 2 })
    gb.box({ side: M.woodDark, top: null, x0: bx0 - 0.01, y0: props.y0, z0: bz0 - 0.01, x1: bx1 + 0.01, y1: props.y0 + 0.28, z1: bz1 + 0.01, repeat: 2 })
  }
  if (apertures.length) {
    const panels = subtractRectangles({ x0: a0, z0: 0, x1: a1, z1: height }, [
      ...cuts.map((entry) => {
        const s = entry[0]
        const e = entry[1]
        return { x0: s, z0: 0, x1: e, z1: openingHeight }
      }),
      ...apertures.map((w) => ({ x0: w.from, z0: w.bottom, x1: w.to, z1: w.top })),
    ])
    for (const p of panels) {
      const bx0State2 = alongX ? [p.x0, props.z0, p.x1, props.z1] : [props.x0, p.x0, props.x1, p.x1],
        bx0 = bx0State2[0],
        bz0 = bx0State2[1],
        bx1 = bx0State2[2],
        bz1 = bx0State2[3]
      const header = cuts.some((entry2) => {
        const s = entry2[0]
        const e = entry2[1]
        return p.x0 >= s && p.x1 <= e && p.z0 >= openingHeight
      })
      gb.box({ side: header ? M.woodDark : M.plaster, top: M.woodDark, x0: bx0, y0: props.y0 + p.z0, z0: bz0, x1: bx1, y1: props.y0 + p.z1, z1: bz1, repeat: 2 })
      if (p.z0 === 0) gb.box({ side: M.woodDark, top: M.woodDark, x0: bx0, y0: props.y0, z0: bz0, x1: bx1, y1: props.y0 + 0.28, z1: bz1, repeat: 2 })
    }
  } else {
    for (const entry3 of cuts) {
      const s = entry3[0]
      const e = entry3[1]

      piece(at.value, s)
      at.value = e
    }
    piece(at.value, a1)
    // the lintel over each gap
    for (const entry4 of cuts) {
      const s = entry4[0]
      const e = entry4[1]

      const bx0State3 = alongX ? [s, props.z0, e, props.z1] : [props.x0, s, props.x1, e],
        bx0 = bx0State3[0],
        bz0 = bx0State3[1],
        bx1 = bx0State3[2],
        bz1 = bx0State3[3]
      gb.box({ side: M.woodDark, top: M.woodDark, x0: bx0, y0: props.y0 + openingHeight, z0: bz0, x1: bx1, y1: props.y0 + height, z1: bz1, repeat: 2 })
    }
  }
  const geometry = gb.build()
  geometry.position.y = -props.y0
  g.position.y = props.y0
  g.add(geometry)
  props.root.add(g)
  return g
}
