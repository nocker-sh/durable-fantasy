import { describe, expect, it } from "vitest"
import { MAPS, walkable, cellDistance, spotsOn, TALK_CELLS } from "../maps/index.ts"
import { findPathCells } from "../test/path.ts"
import { HOUSES } from "./houses.ts"
import { floorPlan } from "./floorplan.ts"
import { INTERIORS, interiorPlan, kindOf } from "./interiors.ts"

describe("buildings you go into", () => {
  it("every door works both ways, onto free ground", () => {
    for (const it of INTERIORS) {
      const inside = MAPS[it.id]
      const street = MAPS[it.house.map]
      expect(inside, it.id).toBeDefined()
      const out = inside.warps[0]
      expect(walkable(inside, out.at), `${it.id} door`).toBe(true)
      expect(walkable(inside, inside.spawn), `${it.id} arrive`).toBe(true)
      expect(walkable(street, out.to.at), `${it.id} outside arrive`).toBe(true)
      const into = street.warps.find((w) => w.to.map === it.id)
      expect(into, `${it.id} street door`).toBeDefined()
      expect(walkable(street, into!.at), `${it.id} street door cell`).toBe(true)
      // arriving does not land you back on the door you came through
      expect(cellDistance(out.to.at, into!.at)).toBeGreaterThan(1)
      expect(cellDistance(into!.to.at, out.at)).toBeGreaterThan(1)
    }
  })

  it("the shopkeeper can be reached from the door to talk across the counter", () => {
    for (const it of INTERIORS) {
      const map = MAPS[it.id]
      for (const npc of spotsOn(map)) {
        const reach = findPathCells(map, map.spawn, (c) => cellDistance(c, npc.cell) <= TALK_CELLS - 2)
        expect(reach, `${it.id} ${npc.name}`).toBe(true)
      }
    }
  })

  it("every shop with a building to enter has its keepers inside, and none left on the street", () => {
    for (const it of INTERIORS.filter((i) => i.house.shop)) {
      const names = MAPS[it.id].npcs.map((n) => n.name)
      expect(names.length, it.id).toBeGreaterThan(0)
      for (const n of names)
        expect(
          MAPS[it.house.map].npcs.some((m) => m.name === n),
          `${n} on the street`,
        ).toBe(false)
    }
  })

  it("nobody stands in a doorway or on a warp", () => {
    for (const map of Object.values(MAPS)) for (const npc of spotsOn(map)) for (const w of map.warps) expect(cellDistance(npc.cell, w.at), `${map.id} ${npc.name}`).toBeGreaterThan(1)
  })
})

it("previews every floor without registering private homes as playable rooms", () => {
  const registered = INTERIORS.map((room) => room.id)
  for (const house of HOUSES) {
    const plan = floorPlan(house.id)
    for (let floor = 0; floor < plan.floors; floor++) {
      const preview = interiorPlan(house, floor)
      expect(preview.floor).toBe(floor)
      const pieces = plan.pieces.filter((piece) => piece.floor === floor && (piece.on || kindOf(piece.name)))
      expect(preview.furniture.filter((piece) => piece.kind !== "partition" && piece.kind !== "lowwall" && piece.kind !== "curtain").length).toBeGreaterThanOrEqual(pieces.length)
      for (const piece of pieces) expect(preview.furniture.some((item) => item.name === piece.name)).toBe(true)
    }
  }
  expect(INTERIORS.map((room) => room.id)).toEqual(registered)
  expect(INTERIORS.every((room) => room.floor === 0)).toBe(true)
})
