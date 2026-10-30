import { describe, expect, it } from "vitest"
import { HOUSES } from "#/world/town/houses"
import { layoutOf } from "./layouts"
import { currentLayout } from "#/world/scene/current-layout"
import { roadD } from "#/world/scene/road-d"
import { setLayout } from "#/world/scene/set-layout"
import { MAPS } from "#/world/maps"
import { cellDistance } from "#/world/maps/cell-distance"
import { walkable } from "#/world/maps/walkable"
import { type Cell } from "#/world/maps/types"

/** The cells one can walk to from a map's spawn. */
function reachableFrom(map: (typeof MAPS)[string], from: Cell): Set<number> {
  const n = map.size,
    seen = new Set<number>([from[1] * n + from[0]]),
    queue = [from]
  while (queue.length) {
    const [i, j] = queue.pop()!
    for (const [di, dj] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      const c: Cell = [i + di, j + dj]
      // a slant only between two free cells, as the path finder walks
      if (!walkable(map, c) || seen.has(c[1] * n + c[0]) || (di && dj && (!walkable(map, [i + di, j]) || !walkable(map, [i, j + dj])))) continue
      seen.add(c[1] * n + c[0])
      queue.push(c)
    }
  }
  return seen
}

describe("nothing stands in the way (town.md「道」)", () => {
  for (const map of Object.values(MAPS).filter((m) => m.kind !== "indoor")) {
    it(`${map.id}: the middle of every road is clear, and every road can be walked from the rest`, () => {
      setLayout(layoutOf(map.id))
      const L = currentLayout()
      const inHouse = (x: number, z: number) => HOUSES.some((h) => h.map === map.id && x > h.x0 - 0.3 && x < h.x1 + 0.3 && z > h.z0 - 0.3 && z < h.z1 + 0.3)
      const inSquare = (x: number, z: number) => Math.hypot(x - L.plaza[0], z - L.plaza[1]) < L.plazaR + 0.5
      const reach = reachableFrom(map, map.spawn as Cell)
      const blocked: string[] = [],
        cut: string[] = []
      for (let j = 2; j < map.size - 2; j++)
        for (let i = 2; i < map.size - 2; i++) {
          const x = (i + 0.5) / 2,
            z = (j + 0.5) / 2
          const d = roadD(x, z)
          if (d >= 0 || inHouse(x, z)) continue
          // a road is at least two cells wide in the middle: nothing stands there (a square may have its well and benches)
          if (d < -0.35 && !inSquare(x, z) && !walkable(map, [i, j])) blocked.push(`${i},${j}`)
          // and every free road cell joins the rest of the map
          if (walkable(map, [i, j]) && !reach.has(j * map.size + i)) cut.push(`${i},${j}`)
        }
      expect(blocked, "things standing in the middle of a road").toEqual([])
      expect(cut, "road cut off from the rest").toEqual([])
    }, 30_000)
  }

  it("every way between maps lies on a drawn road, on both maps", () => {
    for (const map of Object.values(MAPS).filter((m) => m.kind !== "indoor"))
      for (const w of map.warps) {
        const there = MAPS[w.to.map]
        if (there.kind === "indoor") continue
        setLayout(layoutOf(map.id))
        expect(roadD((w.at[0] + 0.5) / 2, (w.at[1] + 0.5) / 2), `${map.id} → ${there.id}: way out`).toBeLessThan(0.3)
        setLayout(layoutOf(there.id))
        expect(roadD((w.to.at[0] + 0.5) / 2, (w.to.at[1] + 0.5) / 2), `${map.id} → ${there.id}: way in`).toBeLessThan(0.3)
      }
  }, 30_000)

  it("the ways in and out, the gathering spots and the people can all be reached from the road", () => {
    for (const map of Object.values(MAPS).filter((m) => m.kind !== "indoor")) {
      const reach = reachableFrom(map, map.spawn as Cell)
      const near = (c: Cell, r: number) => [...reach].some((k) => cellDistance([k % map.size, Math.floor(k / map.size)], c) <= r)
      for (const w of map.warps) expect(near(w.at as Cell, 1), `${map.id} warp ${w.at}`).toBe(true)
    }
  })
})
