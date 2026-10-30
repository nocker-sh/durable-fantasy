import { describe, expect, it } from "vitest"
import { MAPS } from "#/world/maps"
import { cellDistance } from "#/world/maps/cell-distance"
import { npcCell } from "#/world/maps/npc-cell"
import { walkable } from "#/world/maps/walkable"
import { cellsReached } from "#/world/cells-reached"
import { validPath } from "#/world/valid-path"
import { clientMessage } from "#/world/protocol"
import type { Cell } from "#/world/protocol"

const town = MAPS.phanthiet
const free = (c: Cell) => walkable(town, c)

describe("map data", () => {
  it("has a square walk grid with the spawn on a free cell", () => {
    expect(town.rows).toHaveLength(town.size)
    expect(town.rows.every((r: string) => r.length === town.size)).toBe(true)
    expect(free(town.spawn as Cell)).toBe(true)
  })

  it("knows where every shopkeeper stands", () => {
    // by night the stalls and the smithy, by morning the fish stall and the bakery window, on the square;
    // the bakery and inn keepers inside, at their hours (town/routines.ts)
    for (const name of ["オットー", "グレーテ", "ギュンター"]) expect(npcCell(town, name, 22 * 60)).not.toBeNull()
    for (const name of ["ヤコブ", "ハンス"]) expect(npcCell(town, name, 10 * 60)).not.toBeNull()
    expect(npcCell(MAPS["phanthiet-in-bakery"], "マルタ", 8 * 60)).not.toBeNull()
    expect(npcCell(MAPS["phanthiet-in-inn"], "ゲルダ", 20 * 60)).not.toBeNull()
    // and nobody at all at the stalls while the night market sleeps
    expect(npcCell(town, "オットー", 12 * 60)).toBeNull()
  })
})

describe("paths", () => {
  const start: Cell = [38, 80]

  it("accepts steps of one cell over free ground", () => {
    expect(validPath([start], [start, [38, 79], [39, 78]], free)).toBe(true)
  })

  it("refuses jumps, a start away from the player and blocked cells", () => {
    expect(validPath([start], [start, [38, 77]], free)).toBe(false)
    expect(
      validPath(
        [start],
        [
          [50, 50],
          [50, 51],
        ],
        free,
      ),
    ).toBe(false)
    expect(
      validPath(
        [[1, 1]],
        [
          [1, 1],
          [0, 0],
        ],
        free,
      ),
    ).toBe(false)
  })

  it("narrows where a walking player can be by how long they have walked", () => {
    const path: Cell[] = Array.from({ length: 20 }, (_, i) => [38, 80 - i] as Cell)
    const reached = cellsReached(path, 1)
    expect(reached[0][1]).toBeGreaterThanOrEqual(80 - 6)
    expect(reached.some((c) => cellDistance(c, [38, 75]) === 0)).toBe(true)
    expect(cellsReached(path, 100).at(-1)).toEqual(path.at(-1))
  })
})

it("requires a bounded, complete commission queue when collecting", () => {
  const request = { type: "collect", seq: 7, index: 0 }
  const order = { commission: "gunter-sword", readyAt: 1000, q: 1 }
  expect(clientMessage.safeParse(request).success).toBe(false)
  expect(clientMessage.safeParse({ ...request, orders: [order] }).success).toBe(true)
  expect(clientMessage.safeParse({ ...request, orders: Array(4).fill(order) }).success).toBe(false)
  expect(clientMessage.safeParse({ ...request, orders: [{ ...order, q: 4 }] }).success).toBe(false)
})

it("requires the selected stack including wear for warehouse requests", () => {
  const request = { type: "storage", seq: 7, action: "store", index: 0, count: 1 }
  expect(clientMessage.safeParse(request).success).toBe(false)
  const stack = { item: "wood-axe", count: 1, q: 1, by: "ギュンター", dur: 3 }
  const parsed = clientMessage.parse({ ...request, stack })
  expect(parsed).toEqual({ ...request, stack })
  expect(clientMessage.safeParse({ ...request, stack: { ...stack, dur: -1 } }).success).toBe(false)
})
