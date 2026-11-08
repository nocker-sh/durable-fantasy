import { expect, it } from "vitest"
import generated from "#/world/town/floorplan/authored/h-m5"
import { authoredFloorPlan } from "#/world/town/floorplan/authored-floor-plan"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"

const sharedPlan = (): AuthoredPlan => ({
  ...generated,
  id: "shared",
  cellM: 0.5,
  width: 7,
  depth: 5,
  floors: 1,
  entry: [1, 4],
  entrySide: "s",
  entryWidth: 1,
  rooms: [
    { id: "left", name: "left", use: "共用", floor: 0, origin: [0, 0], rows: ["####", "#..#", "#..D", "#..#", "#D##"], furniture: [] },
    { id: "right", name: "right", use: "共用", floor: 0, origin: [3, 0], rows: ["####", "#..#", "D..#", "#..#", "####"], furniture: [] },
  ],
  details: [],
  stairSections: [],
  floorLevels: [{ floor: 0, elevation: 0, ceiling: 2.4, thickness: 0.2 }],
})

it("shares boundary walls and matching door cells without closing their opening", () => {
  const source = sharedPlan()
  const snapshot = structuredClone(source)
  const plan = authoredFloorPlan(source)
  expect(plan.dividers).toEqual([
    { floor: 0, kind: "壁", x0: 1.5, z0: 0.5, x1: 2, z1: 1 },
    { floor: 0, kind: "壁", x0: 1.5, z0: 1.5, x1: 2, z1: 2 },
  ])
  expect(source).toEqual(snapshot)
})

it("rejects inconsistent shared door cells and overlapping room interiors", () => {
  const doorway = sharedPlan()
  Object.assign(doorway.rooms[1], { rows: ["####", "#..#", "#..#", "#..#", "####"] })
  expect(() => authoredFloorPlan(doorway)).toThrow("Overlapping authored rooms: right")
  const interior = sharedPlan()
  Object.assign(interior.rooms[1], { origin: [2, 0] })
  expect(() => authoredFloorPlan(interior)).toThrow("Overlapping authored rooms: right")
})

it("rejects missing origin coordinates and ragged room grids", () => {
  for (const invalid of [{ origin: [] }, { origin: [0] }, { rows: ["###", "##"] }]) {
    const source = sharedPlan()
    Object.assign(source.rooms[0], invalid)
    expect(() => authoredFloorPlan(source)).toThrow("Invalid authored room: left")
  }
})

it.each([
  { tile: "#", reverse: false },
  { tile: "#", reverse: true },
  { tile: "D", reverse: false },
  { tile: "D", reverse: true },
])("rejects sharing internal cells through the runtime projection: %j", (input) => {
  const source = sharedPlan()
  const outer: AuthoredPlan["rooms"][number] = { ...source.rooms[0], rows: ["####", `#${input.tile}.#`, "#..D", "#..#", "#D##"] }
  const inner: AuthoredPlan["rooms"][number] = { ...source.rooms[1], origin: [1, 1], rows: [input.tile] }
  source.rooms = input.reverse ? [inner, outer] : [outer, inner]
  expect(() => authoredFloorPlan(source)).toThrow("Overlapping authored rooms")
})
