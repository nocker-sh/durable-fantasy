import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { HOUSES } from "#/world/town/houses"
import type { HouseDef } from "#/world/town/house-types"
import { groundH } from "#/world/scene/ground-h"
import { blockRect } from "#/world/scene/block-rect"
import { roadD } from "#/world/scene/road-d"
import { isFree } from "#/world/scene/is-free"
import type { V2 } from "#/world/scene/construction/registry"
import { M } from "#/world/scene/construction/materials"
import { woodpile } from "#/world/scene/construction/woodpile"
import { barrel } from "#/world/scene/construction/barrel"
import { baseOf } from "#/world/scene/construction/helpers/houses/base-of"
import type { Side } from "#/world/scene/construction/houses"
import { SIDE, leanTos } from "#/world/scene/construction/houses"
import { sideOf } from "#/world/scene/construction/helpers/houses/side-of"
import { doorAt } from "#/world/scene/construction/helpers/houses/door-at"
import { roofMat } from "#/world/scene/construction/helpers/houses/roof-mat"

/**
 * A lean-to against a side wall: a low roof on two posts over the household's firewood or barrels,
 * where the ground beside the wall is free, off the road and away from every door on the map.
 */
export function leanTo(root: THREE.Group, h: HouseDef, map: string) {
  const opposite = { n: "s", s: "n", e: "w", w: "e" } as const
  const ends: Side[] = h.door.side === "n" || h.door.side === "s" ? ["e", "w"] : ["n", "s"]
  const doors = HOUSES.filter((o) => o.map === map).map(doorAt)
  for (const side of [...(h.seed % 4 === 0 ? ends : ends.reverse()), opposite[h.door.side]]) {
    const cSource = sideOf(h, side),
      c = cSource.c,
      len = cSource.len,
      nSource = SIDE[side],
      n = nSource.n,
      t = nSource.t
    const L = Math.min(2.4, len * 0.62),
      D = 0.95
    const at = (u: number, o: number): V2 => [c[0] + t[0] * u + n[0] * o, c[1] + t[1] * u + n[1] * o]
    // the ground it would take, a little beyond its posts
    const ok = { value: true }
    for (const u = { value: -L / 2 - 0.2 }; u.value <= L / 2 + 0.2 && ok.value; u.value += 0.25)
      for (const o = { value: 0.15 }; o.value <= D + 0.35 && ok.value; o.value += 0.2) {
        const pxState = at(u.value, o.value),
          px = pxState[0],
          pz = pxState[1]
        if (!isFree(px, pz) || roadD(px, pz) < 0.6 || doors.some((d) => Math.hypot(d[0] - px, d[1] - pz) < 1.6)) ok.value = false
      }
    if (!ok.value) continue
    const gb = new GB()
    const hiSource = baseOf({ x0: h.x0, z0: h.z0, x1: h.x1, z1: h.z1 }),
      hi = hiSource.hi
    const yWall = hi + 0.18 + 1.25,
      yEdge = hi + 0.18 + 0.82
    const rm = roofMat(h.roof === "thatch" ? "roof" : h.roof, h.seed + 1)
    const a = at(-L / 2 - 0.1, 0),
      b = at(L / 2 + 0.1, 0),
      cc = at(L / 2 + 0.1, D + 0.12),
      d = at(-L / 2 - 0.1, D + 0.12)
    gb.quad({ material: rm, a: [a[0], yWall, a[1]], b: [b[0], yWall, b[1]], c: [cc[0], yEdge, cc[1]], d: [d[0], yEdge, d[1]], repeatU: 2, repeatV: 2 })
    // the plate along the wall, and the posts at the front
    const p0 = at(-L / 2 - 0.1, 0.02),
      p1 = at(L / 2 + 0.1, 0.1)
    gb.box({ side: M.woodDark, top: M.woodDark, x0: Math.min(p0[0], p1[0]), y0: yWall - 0.1, z0: Math.min(p0[1], p1[1]), x1: Math.max(p0[0], p1[0]), y1: yWall, z1: Math.max(p0[1], p1[1]), repeat: 2 })
    for (const u of [-L / 2 + 0.05, L / 2 - 0.05]) {
      const pxState2 = at(u, D),
        px = pxState2[0],
        pz = pxState2[1]
      const gy = groundH(px, pz)
      gb.box({ side: M.woodDark, top: M.wood, x0: px - 0.05, y0: gy, z0: pz - 0.05, x1: px + 0.05, y1: yEdge, z1: pz + 0.05, repeat: 2 })
    }
    // under it: split wood stacked against the wall, or a pair of barrels
    const mid = at(0, 0.35)
    if (h.seed % 3 !== 0) woodpile({ gb: gb, x: mid[0], z: mid[1], len: L * 0.8, layers: 4, alongX: t[0] !== 0 })
    else
      for (const u of [-L / 4, L / 4]) {
        const p = at(u, 0.4)
        barrel({ gb: gb, x: p[0], z: p[1], h: 0.62, r: 0.24 })
      }
    root.add(gb.build())
    const q0 = at(-L / 2 - 0.1, 0),
      q1 = at(L / 2 + 0.1, D + 0.12)
    blockRect({ x0: Math.min(q0[0], q1[0]), z0: Math.min(q0[1], q1[1]), x1: Math.max(q0[0], q1[0]), z1: Math.max(q0[1], q1[1]) })
    leanTos.push(`${h.id}:${side}`)
    return
  }
}
