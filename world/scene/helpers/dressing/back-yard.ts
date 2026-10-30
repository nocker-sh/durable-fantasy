import * as THREE from "three"

import type { V2 } from "#/world/scene/construction/registry"

import type { Side } from "#/world/scene/dressing"
const BACK: Record<Side, Side> = { n: "s", s: "n", e: "w", w: "e" }

import { fence } from "#/world/scene/construction/fence"
import { places } from "#/world/scene/construction/registry"

import { HOUSES } from "#/world/town/houses"
import type { HouseDef } from "#/world/town/house-types"
import { OUT, placed } from "#/world/scene/dressing"
import { doorPoint } from "#/world/scene/helpers/dressing/door-point"
import { standing } from "#/world/scene/helpers/dressing/standing"
import { clear } from "#/world/scene/helpers/dressing/clear"

/**
 * A low fence round the ground behind the house, with a gap to go in by: where the household keeps
 * its vegetables, its wood and its odds and ends. As deep as the ground allows, down to a tile and a
 * half; none if the fence would cross a road, a door's way, someone's spot or another house.
 */
export function backYard(root: THREE.Group, h: HouseDef): boolean {
  const back = BACK[h.door.side]
  const oxState = OUT[back],
    ox = oxState[0],
    oz = oxState[1]
  // the back wall's two corners, a little in from the eaves
  const aState: [V2, V2] =
      back === "n"
        ? [
            [h.x0 + 0.2, h.z0],
            [h.x1 - 0.2, h.z0],
          ]
        : back === "s"
          ? [
              [h.x0 + 0.2, h.z1],
              [h.x1 - 0.2, h.z1],
            ]
          : back === "e"
            ? [
                [h.x1, h.z0 + 0.2],
                [h.x1, h.z1 - 0.2],
              ]
            : [
                [h.x0, h.z0 + 0.2],
                [h.x0, h.z1 - 0.2],
              ],
    a = aState[0],
    b = aState[1]
  const spots = [...Object.values(places), ...standing(h.map)]
  const doors = HOUSES.filter((o) => o.map === h.map && o !== h).map(doorPoint)
  for (const depth of [2.6, 2.2, 1.8, 1.5]) {
    const pts: V2[] = [
      [a[0] + ox * 0.15, a[1] + oz * 0.15],
      [a[0] + ox * depth, a[1] + oz * depth],
      [b[0] + ox * depth, b[1] + oz * depth],
      [b[0] + ox * 0.15, b[1] + oz * 0.15],
    ]
    // the fence line itself: clear ground, off the roads and the ways to doors
    const ok = { value: true }
    for (const i = { value: 0 }; i.value < pts.length - 1 && ok.value; i.value++) {
      const pState = [pts[i.value], pts[i.value + 1]],
        p = pState[0],
        q = pState[1]
      const n = Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / 0.25)
      for (const k = { value: 0 }; k.value <= n && ok.value; k.value++) {
        const at: V2 = [p[0] + ((q[0] - p[0]) * k.value) / n, p[1] + ((q[1] - p[1]) * k.value) / n]
        // the ends that meet the wall stand on the house's own eaves ground
        if ((at[0] - a[0]) * ox + (at[1] - a[1]) * oz < 0.6) continue
        ok.value = clear(h, at, 0.15)
      }
    }
    if (!ok.value) continue
    // and inside it nobody's spot and no other door
    const x0State = [Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0]))],
      x0 = x0State[0],
      x1 = x0State[1],
      z0State = [Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1]))],
      z0 = z0State[0],
      z1 = z0State[1]
    const inside = (p: V2) => p[0] > x0 - 0.6 && p[0] < x1 + 0.6 && p[1] > z0 - 0.6 && p[1] < z1 + 0.6
    if (spots.some(inside) || doors.some(inside)) continue
    // the way in: a gap in the middle of the far side
    const gate: V2 = [(pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2]
    fence({ root: root, pts: pts, gaps: [gate], h: 0.55 })
    placed.push(`${h.id}:back-yard`)
    return true
  }
  return false
}
