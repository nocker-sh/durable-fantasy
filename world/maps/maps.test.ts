import { describe, expect, it } from "vitest"
import { findPathCells } from "#/world/test/path"
import { MAPS, TALK_CELLS } from "#/world/maps"
import { cellDistance } from "#/world/maps/cell-distance"
import { isOpen } from "#/world/maps/is-open"
import { spotsOn } from "#/world/maps/spots-on"
import { walkable } from "#/world/maps/walkable"
import { WORLD_NODES } from "#/world/maps/world-map"
import { GRID_SIZE, OPPOSITE, STEP, WORLD } from "#/world/maps/grid"
import { across } from "#/world/maps/across"
import { squareAt } from "#/world/maps/square-at"
import { squareOf } from "#/world/maps/square-of"
import { type Side } from "#/world/maps/grid-types"
import { NODES } from "#/world/core/gather"
import { REACH } from "#/world/core/gather-rules"

describe("every map can be walked through", () => {
  for (const map of Object.values(MAPS)) {
    it(`${map.id}: spawn and warps on free ground, every warp reachable from the spawn`, () => {
      expect(walkable(map, map.spawn), "spawn").toBe(true)
      for (const w of map.warps) {
        expect(walkable(map, w.at), `warp ${w.at}`).toBe(true)
        const there = MAPS[w.to.map]
        expect(there, `warp to ${w.to.map}`).toBeDefined()
        expect(walkable(there, w.to.at), `arrival ${w.to.map} ${w.to.at}`).toBe(true)
        // you arrive clear of the way back, so you are not sent straight back
        for (const back of there.warps) expect(cellDistance(back.at, w.to.at), `${w.to.map} arrival next to a warp`).toBeGreaterThan(1)
        expect(
          findPathCells(map, map.spawn, (c) => cellDistance(c, w.at) <= 1),
          `reach ${w.at} → ${w.to.map}`,
        ).toBe(true)
      }
      // every gathering spot here can be walked up to
      for (const n of NODES.filter((x) => x.map === map.id))
        expect(
          findPathCells(map, map.spawn, (c) => cellDistance(c, n.cell) <= REACH - 1),
          `gather at ${n.id}`,
        ).toBe(true)
      // everyone standing here can be walked up to and spoken to
      for (const npc of spotsOn(map))
        expect(
          findPathCells(map, map.spawn, (c) => cellDistance(c, npc.cell) <= TALK_CELLS - 1),
          `talk to ${npc.name}`,
        ).toBe(true)
    })
  }

  it("connects the town to all built outdoor routes while unbuilt cities stay closed", () => {
    const reach = (start: string) => {
      const seen = new Set<string>([start])
      const queue = [start]
      while (queue.length)
        for (const w of MAPS[queue.shift()!].warps)
          if (!seen.has(w.to.map) && isOpen(w.to.map)) {
            seen.add(w.to.map)
            queue.push(w.to.map)
          }
      return seen
    }
    const open = reach("phanthiet")
    expect([...open].filter((id) => MAPS[id].kind === "field").sort()).toEqual([
      "deep-forest",
      "forest-edge",
      "hue-gate",
      "mountain-pass",
      "net-sheds",
      "quynhon-gate",
      "red-dunes",
      "sea-cliff",
      "south-meadow",
    ])
    // the forest is reached from the meadow, not round by the sea
    expect(MAPS["south-meadow"].warps.some((w) => w.to.map === "forest-edge")).toBe(true)
    // every town map and building is open
    for (const id of Object.keys(MAPS)) if (MAPS[id].kind !== "field") expect(open.has(id), id).toBe(true)
    for (const id of ["red-dunes", "sea-cliff", "net-sheds", "quynhon-gate", "mountain-pass", "hue-gate"]) {
      expect(isOpen(id), id).toBe(true)
      expect(open.has(id), `town to ${id}`).toBe(true)
      expect(reach(id).has("phanthiet"), `${id} back to town`).toBe(true)
    }
    for (const id of ["quynhon", "hue", "unknown-map", "constructor", "toString", "__proto__"]) expect(isOpen(id), id).toBe(false)
  })

  it("the maps lie on the world grid: every outdoor map has a square, all of one size", () => {
    const outdoor = Object.values(MAPS).filter((m) => m.kind !== "indoor")
    for (const m of outdoor) {
      expect(squareOf(m.id), m.id).toBeDefined()
      expect(m.size, m.id).toBe(96)
    }
    const taken = WORLD.map((s) => s.at.join(","))
    expect(new Set(taken).size, "one thing to a square").toBe(taken.length)
    for (const s of WORLD) expect(s.at[0] < GRID_SIZE.cols && s.at[1] < GRID_SIZE.rows, s.at.join(",")).toBe(true)
  })

  it("the ways between maps follow the grid: out of one side, in at the facing side of the square across, at the same place along it, and back", () => {
    const sideOf = (c: readonly number[], size: number): Side => (c[0] <= 10 ? "w" : c[0] >= size - 11 ? "e" : c[1] <= 10 ? "n" : "s")
    for (const m of Object.values(MAPS)) {
      if (m.kind === "indoor") continue
      const sq = squareOf(m.id)!
      const ways = m.warps.filter((w) => MAPS[w.to.map].kind !== "indoor")
      // a way across every open side with a map beyond it, and no other
      const open = (["n", "e", "s", "w"] as Side[]).filter((d) => across(sq, d)?.map)
      expect(ways.map((w) => sideOf(w.at, m.size)).sort(), m.id).toEqual(open.sort())
      for (const w of ways) {
        const side = sideOf(w.at, m.size),
          at = `${m.id} → ${w.to.map}`
        expect(across(sq, side)?.map, at).toBe(w.to.map)
        const t = MAPS[w.to.map]
        // you come in by the facing side, at the same place along it
        expect(sideOf(w.to.at, t.size), at).toBe(OPPOSITE[side])
        const along = (c: readonly number[]) => (side === "e" || side === "w" ? c[1] : c[0])
        expect(along(w.to.at), at).toBe(along(w.at))
        // the way back starts where you came in and brings you out where you left
        const back = t.warps.find((x) => x.to.map === m.id)!
        expect(cellDistance(back.at, w.to.at), `way back ${at}`).toBe(5)
        expect(cellDistance(back.to.at, w.at), `back where you left ${at}`).toBe(5)
        // the world map puts the next map the same way
        const a = WORLD_NODES.find((n) => n.id === m.id)!,
          b = WORLD_NODES.find((n) => n.id === t.id)!
        const dx = b.x - a.x,
          dy = b.y - a.y
        expect(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "e" : "w") : dy > 0 ? "s" : "n", `world map: ${at}`).toBe(side)
      }
    }
  })

  it("walled sides let nothing across", () => {
    for (const s of WORLD)
      for (const d of s.walls ?? []) {
        const m = s.map && MAPS[s.map]
        const o = squareAt(s.at[0] + STEP[d][0], s.at[1] + STEP[d][1])
        if (m && o?.map)
          expect(
            m.warps.some((w) => w.to.map === o.map),
            `${s.map} ${d}`,
          ).toBe(false)
      }
  })
})
