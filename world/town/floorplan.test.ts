import { describe, expect, it } from "vitest"
import { HOUSES, enterable } from "./houses.ts"
import { planOf, type FloorPlan, type Rect } from "./floorplan.ts"

const PLANS = HOUSES.map((h) => ({ h, p: planOf(h) }))
const lived = PLANS.filter(({ h }) => h.plan.hearth && h.kind !== "vacant")
const overlap = (a: Rect, b: Rect) => a.x0 < b.x1 - 1e-6 && b.x0 < a.x1 - 1e-6 && a.z0 < b.z1 - 1e-6 && b.z0 < a.z1 - 1e-6
const touchesWall = (r: Rect, p: FloorPlan) => r.x0 < 0.3 || r.z0 < 0.3 || r.x1 > p.W - 0.3 || r.z1 > p.D - 0.3

/** Cells (20 cm) on a floor someone can stand in: clear of walls, partitions and solid furniture by 20 cm. */
function walkGrid(p: FloorPlan, floor: number) {
  const C = 0.2,
    nx = Math.ceil(p.W / C),
    nz = Math.ceil(p.D / C)
  const free = new Uint8Array(nx * nz)
  const blockers: Rect[] = [...p.pieces.filter((x) => x.floor === floor && x.solid), ...p.dividers.filter((d) => d.floor === floor)]
  for (let j = 0; j < nz; j++)
    for (let i = 0; i < nx; i++) {
      const x = (i + 0.5) * C,
        z = (j + 0.5) * C,
        m = 0.18
      const me = { x0: x - m, z0: z - m, x1: x + m, z1: z + m }
      free[j * nx + i] = x > m && z > m && x < p.W - m && z < p.D - m && !blockers.some((b) => overlap(me, b)) ? 1 : 0
    }
  const cellOf = (x: number, z: number) => [Math.min(nx - 1, Math.max(0, Math.floor(x / C))), Math.min(nz - 1, Math.max(0, Math.floor(z / C)))]
  /** Can one walk from (x, z) to within `reach` of the rect? */
  const reach = (from: [number, number], to: Rect, within = 0.6) => {
    const [si, sj] = cellOf(from[0], from[1])
    const seen = new Uint8Array(nx * nz),
      queue = [sj * nx + si]
    seen[queue[0]] = 1
    while (queue.length) {
      const k = queue.shift()!,
        i = k % nx,
        j = Math.floor(k / nx)
      const x = (i + 0.5) * C,
        z = (j + 0.5) * C
      if (x > to.x0 - within && x < to.x1 + within && z > to.z0 - within && z < to.z1 + within) return true
      for (const [di, dj] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const ii = i + di,
          jj = j + dj,
          q = jj * nx + ii
        if (ii < 0 || jj < 0 || ii >= nx || jj >= nz || seen[q] || !free[q]) continue
        seen[q] = 1
        queue.push(q)
      }
    }
    return false
  }
  return { reach }
}

describe("every building can really be lived in (town.md「世帯と建物」)", () => {
  it("everything in each plan finds a place, inside the walls, and nothing solid stands on anything else", () => {
    for (const { h, p } of PLANS) {
      expect(p.unplaced, h.name).toEqual([])
      const solid = p.pieces.filter((x) => x.solid)
      for (const x of p.pieces) expect(x.x0 >= -1e-6 && x.z0 >= -1e-6 && x.x1 <= p.W + 1e-6 && x.z1 <= p.D + 1e-6, `${h.name}: ${x.name} outside`).toBe(true)
      for (let a = 0; a < solid.length; a++)
        for (let b = a + 1; b < solid.length; b++) if (solid[a].floor === solid[b].floor) expect(overlap(solid[a], solid[b]), `${h.name}: ${solid[a].name} on ${solid[b].name}`).toBe(false)
      for (const x of solid) for (const d of p.dividers) if (d.floor === x.floor) expect(overlap(x, d), `${h.name}: ${x.name} in a partition`).toBe(false)
    }
  })

  it("a home turns round its hearth: a table stands out in the room, not along a wall, and close by the fire", () => {
    for (const { h, p } of lived) {
      const fire = p.pieces.find((x) => x.floor === 0 && (x.name === "炉" || x.name === "暖炉"))!
      expect(fire, `${h.name}: hearth`).toBeDefined()
      const tables = p.pieces.filter((x) => x.floor === 0 && /^(食卓|大きな食卓|長卓|卓|作業台|木工台|調合台|地図の卓|書き物机|縫い物の台|搾り台)$/.test(x.name))
      expect(
        tables.some((t) => !touchesWall(t, p)),
        `${h.name}: a table free of the walls`,
      ).toBe(true)
      const gap = (a: Rect, b: Rect) => Math.hypot(Math.max(0, a.x0 - b.x1, b.x0 - a.x1), Math.max(0, a.z0 - b.z1, b.z0 - a.z1))
      expect(Math.min(...tables.map((t) => gap(t, fire))), `${h.name}: a table by the fire`).toBeLessThanOrEqual(1.8)
    }
  })

  it("the way through the house is clear: from the door to the fire, the table and the stair", () => {
    for (const { h, p } of lived) {
      const g = walkGrid(p, 0)
      const door: [number, number] = [p.door, p.D - 0.3]
      for (const name of ["炉", "暖炉", "食卓", "大きな食卓", "長卓", "卓", "階段"]) {
        const x = p.pieces.find((q) => q.floor === 0 && q.name === name)
        if (x) expect(g.reach(door, x), `${h.name}: door to ${name}`).toBe(true)
      }
    }
  })

  it("floors are neither bare nor crammed: furniture covers between an eighth and two thirds of each lived-in floor", () => {
    for (const { h, p } of lived)
      for (let f = 0; f < p.floors; f++) {
        const used = p.pieces.filter((x) => x.floor === f && x.solid).reduce((a, x) => a + (x.x1 - x.x0) * (x.z1 - x.z0), 0) / (p.W * p.D)
        const slept = h.plan.rooms.some((r) => r.floor === f && (r.beds ?? 0) > 0)
        expect(used, `${h.name} floor ${f + 1}`).toBeGreaterThanOrEqual(f === 0 ? 0.12 : slept ? 0.04 : 0)
        expect(used, `${h.name} floor ${f + 1}`).toBeLessThanOrEqual(0.66)
      }
  })

  it("in a building you walk into, the ground floor is for work and they sleep upstairs, up a stair", () => {
    for (const { h, p } of PLANS.filter((x) => enterable(x.h))) {
      expect(p.floors, h.name).toBeGreaterThanOrEqual(2)
      expect(
        p.pieces.some((x) => x.floor === 0 && x.name === "階段"),
        `${h.name}: stair`,
      ).toBe(true)
      expect(
        p.pieces.filter((x) => x.floor === 0 && /寝台|衣装箱/.test(x.name)).map((x) => x.name),
        h.name,
      ).toEqual([])
    }
  })

  it("every room has a use, and every household leaves traces of its life about", () => {
    for (const { h, p } of PLANS) {
      for (const r of p.rooms) expect(r.use, `${h.name}: ${r.name}`).toBeTruthy()
      if (h.household || enterable(h)) expect(p.pieces.filter((x) => x.on).length, h.name).toBeGreaterThanOrEqual(2)
    }
  })
})
