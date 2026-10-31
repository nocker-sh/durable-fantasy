import { expect, it } from "vitest"
import { RoomDoorwayInventory } from "#/scripts/lib/room-doorway-inventory"

it("accounts for every cell of a wide horizontal opening", () => {
  const inventory = new RoomDoorwayInventory({ roomId: "room", rows: ["#DD#", "#..#", "####"], cellMetres: 0.5 })
  expect(inventory.addConnection({ door: [1, 0], width_cells: 2, target: "outside" })).toEqual([])
  expect(inventory.getMissingConnectionErrors()).toEqual([])
})
it("accounts for every cell of a wide vertical opening", () => {
  const inventory = new RoomDoorwayInventory({ roomId: "room", rows: ["###", "D.#", "D.#", "###"], cellMetres: 0.5 })
  expect(inventory.addConnection({ door: [0, 1], width_cells: 2, target: "outside" })).toEqual([])
  expect(inventory.getMissingConnectionErrors()).toEqual([])
})
it("reports partially duplicated doorway ownership", () => {
  const inventory = new RoomDoorwayInventory({ roomId: "room", rows: ["#DD#", "#..#", "####"], cellMetres: 1 })
  inventory.addConnection({ door: [1, 0], width_cells: 2, target: "first" })
  expect(inventory.addConnection({ door: [2, 0], width_cells: 1, target: "second" })).toEqual(["room: doorway cell has multiple connections"])
})
it("retains orphaned doorway cells when a declared span is not bounded by the grid", () => {
  const inventory = new RoomDoorwayInventory({ roomId: "room", rows: ["#DD#", "#..#", "####"], cellMetres: 1 })
  expect(inventory.addConnection({ door: [1, 0], width_cells: Number.MAX_SAFE_INTEGER, target: "outside" })).toEqual(["room: doorway footprint disagrees with grid"])
  expect(inventory.getMissingConnectionErrors()).toEqual(["room: doorway cell has no connection at 1,0", "room: doorway cell has no connection at 2,0"])
})
it("owns its source rows without rewriting the connection", () => {
  const rows = ["#DD#", "#..#", "####"]
  const inventory = new RoomDoorwayInventory({ roomId: "room", rows, cellMetres: 0.5 })
  rows[0] = "####"
  const connection = { door: [1, 0] satisfies [number, number], width_cells: 2, target: "outside" },
    original = structuredClone(connection)
  expect(inventory.addConnection(connection)).toEqual([])
  expect(inventory.getMissingConnectionErrors()).toEqual([])
  expect(connection).toEqual(original)
  expect(Object.isFrozen(inventory)).toBe(true)
})
