import { interiorRows } from "#/world/town/interior-rows"
import type { Cell, Interior } from "#/world/town/interiors"
import { stairGeometry } from "./floorplan/stair-geometry"
import type { Rect } from "./floorplan/types"

export type StairLink = { at: Cell; to: { map: string; at: Cell } }
const distance = (a: Cell, b: Cell) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]))

/** Stair travel starts on a landing and arrives clear of every return trigger. */
export function interiorStairLinks(interiors: readonly Interior[]): ReadonlyMap<string, readonly StairLink[]> {
  const links = new Map<string, StairLink[]>(),
    rows = new Map(interiors.map((it) => [it.id, interiorRows(it)]))
  const free = (id: string, c: Cell) => rows.get(id)?.[c[1]]?.[c[0]] === "."
  const endpoints: { map: string; at: Cell; targetMap: string; targetAt: Cell }[] = []
  const trigger = (it: Interior, landing: Rect, flight: Rect): Cell => {
    const candidates: Cell[] = []
    for (let z = Math.floor(landing.z0 * 2); z <= Math.ceil(landing.z1 * 2); z++)
      for (let x = Math.floor(landing.x0 * 2); x <= Math.ceil(landing.x1 * 2); x++) {
        const wx = (x + 0.5) / 2,
          wz = (z + 0.5) / 2
        if (wx > landing.x0 && wx < landing.x1 && wz > landing.z0 && wz < landing.z1 && free(it.id, [x, z])) candidates.push([x, z])
      }
    const score = (c: Cell) => {
      const x = (c[0] + 0.5) / 2,
        z = (c[1] + 0.5) / 2
      const gap = Math.hypot(Math.max(flight.x0 - x, 0, x - flight.x1), Math.max(flight.z0 - z, 0, z - flight.z1))
      return gap * 100 + Math.hypot(x - (landing.x0 + landing.x1) / 2, z - (landing.z0 + landing.z1) / 2)
    }
    candidates.sort((a, b) => score(a) - score(b) || a[1] - b[1] || a[0] - b[0])
    if (!candidates[0]) throw new Error(`Stair landing has no walkable trigger: ${it.id}`)
    return candidates[0]
  }
  for (const lower of interiors)
    for (const s of lower.stairSections ?? [])
      if (lower.floor === s.lowerFloor) {
        const upper = interiors.find((it) => it.house.id === lower.house.id && it.floor === s.upperFloor)
        if (!upper) throw new Error(`Stair destination floor is missing: ${s.id}`)
        const g = stairGeometry(s),
          a = trigger(lower, g.lowerLanding, g.flight),
          b = trigger(upper, g.upperLanding, g.flight)
        endpoints.push({ map: lower.id, at: a, targetMap: upper.id, targetAt: b }, { map: upper.id, at: b, targetMap: lower.id, targetAt: a })
      }
  const arrival = (map: string, start: Cell): Cell => {
    const queue: { at: Cell; steps: number }[] = [{ at: start, steps: 0 }],
      seen = new Set([start.join(",")])
    const interior = interiors.find((it) => it.id === map)!
    const triggers = [...endpoints.filter((e) => e.map === map).map((e) => e.at), ...(interior.floor === 0 ? [interior.door] : [])]
    for (let index = 0; index < queue.length; index++) {
      const atSource = queue[index],
        at = atSource.at,
        steps = atSource.steps
      if (triggers.every((trigger) => distance(at, trigger) > 1)) return at
      if (steps >= 4) continue
      for (const entry of [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
      ]) {
        const dx = entry[0]
        const dz = entry[1]

        const next: Cell = [at[0] + dx, at[1] + dz],
          key = next.join(",")
        if (!seen.has(key) && free(map, next)) {
          seen.add(key)
          queue.push({ at: next, steps: steps + 1 })
        }
      }
    }
    throw new Error(`Stair landing has no safe arrival: ${map}`)
  }
  for (const e of endpoints) {
    const list = links.get(e.map) ?? []
    if (list.some((link) => link.at[0] === e.at[0] && link.at[1] === e.at[1])) throw new Error(`Stair triggers overlap: ${e.map}`)
    list.push({ at: e.at, to: { map: e.targetMap, at: arrival(e.targetMap, e.targetAt) } })
    links.set(e.map, list)
  }
  return links
}
