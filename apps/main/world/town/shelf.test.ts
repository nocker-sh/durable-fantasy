import { expect, it } from "vitest"
import { shelfParts } from "#/world/town/shelf-parts"
import { shelfBays } from "#/world/town/shelf-bays"
import { shelfItemParts } from "#/world/town/shelf-item-parts"
import { scaleShelf } from "#/world/town/scale-shelf"
import { shelfLidHandle } from "#/world/town/shelf-lid-handle"
import type { ShelfSpec } from "#/world/town/shelf"
const shelf: ShelfSpec = {
  height: 1.1,
  board: 0.035,
  levels: [0.1, 0.4, 0.75, 1.1],
  front: "s",
  items: [{ id: "records", kind: "papers", board: 0, across: 0, fromBack: 0.08, width: 0.3, height: 0.06, depth: 0.3 }],
}
it("rests boards on full-height sides and measures clear storage space below the next board", () => {
  const parts = shelfParts({ x: 0, z: 0, width: 2, depth: 0.5, floor: 3, shelf: shelf }),
    sides = parts.filter((p) => p.part === "side"),
    boards = parts.filter((p) => p.part === "board")
  expect(sides).toHaveLength(2)
  for (const side of sides) {
    expect(side.y0).toBe(3)
    expect(side.y1).toBe(4.1)
  }
  expect(boards.map((p) => p.y1 - 3)).toEqual(expect.arrayContaining(shelf.levels.map((y) => expect.closeTo(y))))
  const bay = shelfBays(2, 0.5, shelf)[0]
  expect(bay.width).toBeCloseTo(1.93, 12)
  expect(bay.depth).toBeCloseTo(0.465, 12)
  expect(bay.height).toBeCloseTo(0.265, 12)
  const paper = shelfItemParts({ x: 0, z: 0, width: 2, depth: 0.5, floor: 3, shelf: shelf })[0]
  expect(paper.y0).toBe(boards[0].y1)
  expect(paper.y1).toBeLessThan(boards[1].y0)
})
it("rotates each front without changing its footprint and scales contents with their supporting shelf", () => {
  for (const front of ["n", "s", "w", "e"] as const) {
    const spec = { ...shelf, front },
      a = shelfItemParts({ x: 0, z: 0, width: 2, depth: 2, floor: 0, shelf: spec }),
      b = shelfItemParts({ x: 0, z: 0, width: 3, depth: 3, floor: 0, shelf: scaleShelf(spec, 1.5) })
    for (const key of ["x0", "z0", "x1", "z1", "y0", "y1"] as const) expect(b[0][key]).toBeCloseTo(a[0][key] * 1.5)
    const parts = shelfParts({ x: 4, z: 5, width: 2, depth: 0.5, floor: 0, shelf: spec })
    for (const part of parts) {
      expect(part.x0).toBeGreaterThanOrEqual(3)
      expect(part.x1).toBeLessThanOrEqual(5)
      expect(part.z0).toBeGreaterThanOrEqual(4.75)
      expect(part.z1).toBeLessThanOrEqual(5.25)
    }
  }
})
it("rejects collapsed bays, overflowing contents and two objects in the same space", () => {
  expect(() => shelfParts({ x: 0, z: 0, width: 2, depth: 0.5, floor: 0, shelf: { ...shelf, levels: [0.1, 0.12, 1.1] } })).toThrow("Invalid shelf")
  expect(() => shelfItemParts({ x: 0, z: 0, width: 2, depth: 0.5, floor: 0, shelf: { ...shelf, items: [{ ...shelf.items![0], height: 0.5 }] } })).toThrow("do not fit")
  expect(() => shelfItemParts({ x: 0, z: 0, width: 2, depth: 0.5, floor: 0, shelf: { ...shelf, items: [...shelf.items!, { ...shelf.items![0], id: "second" }] } })).toThrow("overlap")
})

it("rotates and scales the handle with the stored box and includes it in shelf headroom", () => {
  const item = {
    id: "ash",
    kind: "box" as const,
    board: 0,
    across: 0,
    fromBack: 0.05,
    width: 0.32,
    depth: 0.28,
    height: 0.26,
    wall: 0.0015,
    lid: 0.0015,
    lidHandle: { span: 0.08, depth: 0.018, height: 0.04, thickness: 0.003 },
  }
  for (const front of ["n", "s", "e", "w"] as const) {
    const s = { height: 0.36, board: 0.025, levels: [0.05, 0.36], front, items: [item] },
      scaled = scaleShelf(s, 3)
    expect(shelfLidHandle(s, item)?.axis).toBe(front === "e" || front === "w" ? "z" : "x")
    expect(scaled.items![0].lidHandle!.height).toBeCloseTo(0.12, 12)
    expect(shelfItemParts({ x: 0, z: 0, width: 1.5, depth: 1.5, floor: 0, shelf: scaled })[0].y1).toBeCloseTo(0.93, 12)
  }
  expect(() => shelfItemParts({ x: 0, z: 0, width: 0.5, depth: 0.5, floor: 0, shelf: { height: 0.32, board: 0.025, levels: [0.05, 0.32], front: "s", items: [item] } })).toThrow("do not fit")
})
