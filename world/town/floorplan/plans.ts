import type { HouseDef } from "../house-types.ts"
import type { Rect } from "./types.ts"
import { HOUSES } from "../houses.ts"
import type { FloorPlan } from "./types.ts"
import { layout } from "./layout.ts"

const memo = new Map<string, FloorPlan>()

/** Every building's plan, worked out once. */
export function floorPlan(id: string): FloorPlan {
  let p = memo.get(id)
  if (!p) {
    p = planOf(HOUSES.find((h) => h.id === id)!)
    memo.set(id, p)
  }
  return p
}

/**
 * Lay out one building: the shop floor is tried at a few depths, and the layout that holds
 * everything, with a table standing free near the fire, is kept.
 */
export function planOf(h: HouseDef): FloorPlan {
  let best: { p: FloorPlan; score: number } | null = null
  for (const fire of ["auto", "wall", "centre"] as const)
    for (const depth of [0.48, 0.42, 0.38, 0.55, 0.62]) {
      const p = layout(h, depth, fire)
      const tables = p.pieces.filter((x) => x.floor === 0 && x.solid && /^(食卓|大きな食卓|長卓|卓|作業台|木工台|調合台|地図の卓|書き物机|縫い物の台|搾り台)$/.test(x.name))
      const free = tables.some((x) => x.x0 > 0.3 && x.z0 > 0.3 && x.x1 < p.W - 0.3 && x.z1 < p.D - 0.3)
      const fireAt = p.pieces.find((x) => x.floor === 0 && (x.name === "炉" || x.name === "暖炉"))
      const gap = (a: Rect, b: Rect) => Math.hypot(Math.max(0, a.x0 - b.x1, b.x0 - a.x1), Math.max(0, a.z0 - b.z1, b.z0 - a.z1))
      const byFire = !fireAt || tables.some((t) => gap(t, fireAt) <= 1.8)
      const score = p.unplaced.length * 10 + (h.plan.hearth && !free ? 5 : 0) + (h.plan.hearth && !byFire ? 3 : 0)
      if (!best || score < best.score) best = { p, score }
      if (score === 0) return p
    }
  return best!.p
}
