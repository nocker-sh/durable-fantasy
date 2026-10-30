import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import type { V2 } from "#/world/scene/construction/registry"
import { Rng } from "#/lib/engine/random"
import { groundH } from "#/world/scene/ground-h"
import { isFree } from "#/world/scene/is-free"
import { roadD } from "#/world/scene/road-d"
import type { HouseDef } from "#/world/town/house-types"
import { OUT, stepMat, stepDark, placed } from "#/world/scene/dressing"
import { doorPoint } from "#/world/scene/helpers/dressing/door-point"

/**
 * Flat stones from the door to the nearest road, worn in by the household's comings and goings.
 * It heads straight out of the door for a step, then each stone goes where the road is nearest,
 * round anything standing. Nothing is laid if the road is not reached within a few tiles.
 */
export function doorPath(gb: GB, h: HouseDef) {
  const door = doorPoint(h)
  if (roadD(door[0], door[1]) < 0.4) return
  const oxState = OUT[h.door.side],
    ox = oxState[0],
    oz = oxState[1]
  const stones: V2[] = []
  const p: { value: V2 } = { value: [door[0] + ox * 0.1, door[1] + oz * 0.1] },
    dir: { value: V2 } = { value: [ox, oz] }
  for (const k = { value: 0 }; k.value < 16; k.value++) {
    stones.push(p.value)
    if (roadD(p.value[0], p.value[1]) < 0) break
    if (k.value >= 1) {
      // of the ways ahead (never back towards the house), the one that comes nearest the road
      const best: { value: V2 | null } = { value: null },
        bestD = { value: Infinity }
      for (const a = { value: -2 }; a.value <= 2; a.value++) {
        const ang = Math.atan2(dir.value[1], dir.value[0]) + (a.value * Math.PI) / 8
        const d: V2 = [Math.cos(ang), Math.sin(ang)]
        const q: V2 = [p.value[0] + d[0] * 0.42, p.value[1] + d[1] * 0.42]
        if (!isFree(q[0], q[1]) && roadD(q[0], q[1]) >= 0) continue
        const rd = roadD(q[0], q[1]) + Math.abs(a.value) * 0.02
        if (rd < bestD.value) {
          bestD.value = rd
          best.value = d
        }
      }
      if (!best.value) return
      dir.value = best.value
    }
    p.value = [p.value[0] + dir.value[0] * 0.42, p.value[1] + dir.value[1] * 0.42]
  }
  if (roadD(stones[stones.length - 1][0], stones[stones.length - 1][1]) >= 0) return
  const r = new Rng(h.seed * 13 + 5)
  for (const entry of stones.slice(0, -1)) {
    const x = entry[0]
    const z = entry[1]

    const w = 0.13 + r.next() * 0.05,
      d = 0.1 + r.next() * 0.04
    const jx = (r.next() - 0.5) * 0.08,
      jz = (r.next() - 0.5) * 0.08
    const y = groundH(x + jx, z + jz)
    gb.box({ side: r.next() < 0.3 ? stepDark : stepMat, top: stepMat, x0: x + jx - w, y0: y - 0.02, z0: z + jz - d, x1: x + jx + w, y1: y + 0.035, z1: z + jz + d, repeat: 1 })
  }
  placed.push(`${h.id}:door-path`)
}
