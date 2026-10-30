import { describe, expect, it } from "vitest"
import { MAPS, TALK_CELLS } from "#/world/maps"
import { walkable } from "#/world/maps/walkable"
import { cellDistance } from "#/world/maps/cell-distance"
import { spotsOn } from "#/world/maps/spots-on"
import { findPathCells } from "#/world/test/path"
import { HOUSES } from "#/world/town/houses"
import { floorPlan } from "#/world/town/floorplan/floor-plan"
import { getInteriorPiece } from "#/world/town/get-interior-piece"
import { INTERIORS } from "#/world/town/interiors"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { interiorPlan } from "#/world/town/interior-plan"

describe("buildings you go into", () => {
  it("every door works both ways, onto free ground", () => {
    for (const it of INTERIORS.filter((room) => room.floor === 0)) {
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
      const pieces = plan.pieces.filter((piece) => piece.floor === floor)
      expect(
        preview.furniture.filter((piece) => piece.kind !== "partition" && piece.kind !== "lowwall" && piece.kind !== "curtain").length + preview.unrenderedFurniture.length,
      ).toBeGreaterThanOrEqual(pieces.length)
      for (const piece of pieces) expect([...preview.furniture, ...preview.unrenderedFurniture].some((item) => item.name === piece.name)).toBe(true)
    }
  }
  expect(INTERIORS.map((room) => room.id)).toEqual(registered)
  expect(INTERIORS.filter((room) => !room.house.authored).every((room) => room.floor === 0)).toBe(true)
  expect(INTERIORS.filter((room) => room.house.id === "h-m5").map((room) => room.floor)).toEqual([0, 1])
})

it("rejects nonexistent and noninteger preview floors instead of creating an empty interior", () => {
  const house = HOUSES.find((house) => floorPlan(house.id).floors > 1)!
  for (const floor of [-1, 0.5, NaN, Infinity, floorPlan(house.id).floors]) expect(() => interiorPlan(house, floor)).toThrow(RangeError)
  expect(interiorPlan(house, floorPlan(house.id).floors - 1).floor).toBe(floorPlan(house.id).floors - 1)
})

it("retains a newly introduced unsupported shape instead of silently omitting its identity or footprint", () => {
  const piece = { name: "未登録の作業具", solid: true },
    placement = { x: 12, z: 18, w: 1.2, d: 0.6 }
  const before = JSON.stringify({ piece, placement })
  expect(getInteriorPiece({ piece, placement })).toEqual({ ...placement, ...piece })
  expect(JSON.stringify({ piece, placement })).toBe(before)
  expect(getInteriorPiece({ piece: { ...piece, on: "床" }, placement })).toEqual({ ...placement, name: piece.name, kind: "trace", solid: false, on: "床" })
})

it("distinguishes spinning wheels from looms without moving furniture or changing their collision footprint", () => {
  const house = HOUSES.find((house) => house.id === "h-c2")!,
    room = interiorPlan(house)
  const wheel = room.furniture.find((piece) => piece.name === "糸車")!,
    loom = room.furniture.find((piece) => piece.name === "機織り機")!
  expect(wheel.kind).toBe("spinning-wheel")
  expect(loom.kind).toBe("loom")
  const piece = floorPlan(house.id).pieces.find((piece) => piece.name === "糸車")!
  expect(wheel.x).toBeCloseTo(room.x0 + ((piece.x0 + piece.x1) / 2) * ROOM_SCALE)
  expect(wheel.w).toBeCloseTo((piece.x1 - piece.x0) * ROOM_SCALE)
  expect(wheel.d).toBeCloseTo((piece.z1 - piece.z0) * ROOM_SCALE)
  expect(wheel.solid).toBe(piece.solid)
})
it("renders the repair bench at its original planned footprint rather than dropping it", () => {
  const house = HOUSES.find((house) => house.id === "h9")!,
    room = interiorPlan(house)
  const bench = room.furniture.find((piece) => piece.name === "修理台")!
  expect(bench.kind).toBe("workbench")
  expect(room.unrenderedFurniture.some((piece) => piece.name === "修理台")).toBe(false)
})

it.each([
  ["h-m1", "茶の壺", "tea-jar"],
  ["h-m2", "油壺", "oil-jar"],
  ["h-c1", "釉の甕", "glaze-jar"],
])("restores %s's %s with its purpose and original footprint", (id, name, kind) => {
  const house = HOUSES.find((house) => house.id === id)!,
    room = interiorPlan(house),
    furniture = room.furniture.find((piece) => piece.name === name)!
  const piece = floorPlan(house.id).pieces.find((piece) => piece.name === name)!
  expect(furniture.kind).toBe(kind)
  expect(furniture.x).toBeCloseTo(room.x0 + ((piece.x0 + piece.x1) / 2) * ROOM_SCALE)
  expect(furniture.z).toBeCloseTo(room.z0 + ((piece.z0 + piece.z1) / 2) * ROOM_SCALE)
  expect(furniture.w).toBeCloseTo((piece.x1 - piece.x0) * ROOM_SCALE)
  expect(furniture.d).toBeCloseTo((piece.z1 - piece.z0) * ROOM_SCALE)
  expect(furniture.solid).toBe(piece.solid)
  expect(room.unrenderedFurniture.some((piece) => piece.name === name)).toBe(false)
})

it.each([
  ["h-c1", "ろくろ", "potters-wheel"],
  ["h-g2", "砥石", "whetstone"],
])("restores %s's %s at its original location and scale", (id, name, kind) => {
  const house = HOUSES.find((house) => house.id === id)!,
    room = interiorPlan(house),
    tool = room.furniture.find((piece) => piece.name === name)!
  const piece = floorPlan(house.id).pieces.find((piece) => piece.name === name)!
  expect(tool.kind).toBe(kind)
  expect(tool.x).toBeCloseTo(room.x0 + ((piece.x0 + piece.x1) / 2) * ROOM_SCALE)
  expect(tool.z).toBeCloseTo(room.z0 + ((piece.z0 + piece.z1) / 2) * ROOM_SCALE)
  expect(tool.w).toBeCloseTo((piece.x1 - piece.x0) * ROOM_SCALE)
  expect(tool.d).toBeCloseTo((piece.z1 - piece.z0) * ROOM_SCALE)
  expect(tool.solid).toBe(piece.solid)
  expect(room.unrenderedFurniture.some((piece) => piece.name === name)).toBe(false)
})
