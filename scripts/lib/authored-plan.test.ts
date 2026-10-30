import { auditRoomGrid } from "#/scripts/lib/audit-room-grid"
import { expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { readSetting } from "#/scripts/lib/read-setting"
import { compileAuthoredPlan } from "./authored-plan"
import { authoredFloorPlan } from "#/world/town/floorplan/authored"
import { interiorPlan } from "#/world/town/interior-plan"
import { interiorRows } from "#/world/town/interior-rows"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { HOUSES } from "#/world/town/houses"
import generated from "../../world/town/floorplan/authored/h-m5"

const setting = (kind: string, id: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${kind}/${id}.md`, import.meta.url), "utf8"))
const building = setting("buildings", "building-h-m5")
const documents = (building.rooms as string[]).map((id) => setting("rooms", id))
it("keeps the shipped proposal identical to the authored room metadata", () => {
  expect(compileAuthoredPlan(building, documents)).toEqual(generated)
})
it("projects all room and furniture positions without shrinking the plan", () => {
  const source = compileAuthoredPlan(building, documents),
    plan = authoredFloorPlan(source)
  expect(plan.W).toBe(9)
  expect(plan.D).toBe(10)
  expect(plan.rooms).toHaveLength(4)
  expect(plan.pieces.filter((p) => p.label !== "R")).toHaveLength(29)
  expect(plan.pieces.filter((p) => p.label === "R")).toHaveLength(1)
  expect(plan.pieces.find((p) => p.label === "R")).toMatchObject({ kind: "shelf", floor: 0, x0: 8, z0: 6, x1: 8.5, z1: 6.5, shelf: { items: [{ id: "ash-receiver", boxMaterial: "iron" }] } })
  expect(plan.pieces.find((p) => p.label === "K")).toMatchObject({ kind: "shelf", floor: 0, x0: 3, z0: 5, x1: 3.5, z1: 5.5 })
  expect(plan.pieces.find((p) => p.name === "リナが授業で使う共用椅子")).toMatchObject({ floor: 0, kind: "chair", x0: 4, z0: 7.5, x1: 4.5, z1: 8 })
  const house = HOUSES.find((h) => h.id === "h-m5")!
  const interior = interiorPlan(house, 0, plan)
  expect(interior.x1 - interior.x0).toBe(plan.W * ROOM_SCALE)
  expect(interior.unrenderedFurniture).toEqual([])
  const rows = interiorRows(interior)
  const toCell = (x: number, z: number) => [Math.floor((interior.x0 + x * ROOM_SCALE) * 2), Math.floor((interior.z0 + z * ROOM_SCALE) * 2)]
  // Both cells through the shared partition remain open; the neighbouring wall is solid.
  for (const z of [8.25, 8.75]) {
    const [x, y] = toCell(2.5, z)
    expect(rows[y][x]).toBe(".")
  }
  const [x, y] = toCell(2.5, 7.25)
  expect(rows[y][x]).toBe("#")
})
it("rejects unspecified furniture renderers instead of choosing a similar object", () => {
  const rooms = structuredClone(documents)
  delete rooms[0].furniture![0].runtime_kind
  expect(() => compileAuthoredPlan(building, rooms)).toThrow("Missing explicit renderer")
})
it("rejects wrong furniture kinds, missing rooms and inconsistent scales", () => {
  const rooms = structuredClone(documents)
  rooms[0].furniture![0].runtime_kind = "guess-a-box"
  expect(() => compileAuthoredPlan(building, rooms)).toThrow("Unknown furniture kind")
  expect(() => compileAuthoredPlan(building, documents.slice(1))).toThrow("Missing or inconsistent authored room")
  rooms[0].grid!.cell_m = 0.1
  expect(() => compileAuthoredPlan(building, rooms)).toThrow("Missing or inconsistent authored room")
})

it("rejects overlapping rooms, uncovered floors and furniture outside its room", () => {
  const source = compileAuthoredPlan(building, documents)
  const overlap = structuredClone(source)
  overlap.rooms = overlap.rooms.map((r, i) => (i === 0 ? { ...r, origin: [0, 0] } : r))
  expect(() => authoredFloorPlan(overlap)).toThrow("Overlapping authored rooms")
  const missing = structuredClone(source)
  missing.rooms = missing.rooms.slice(1)
  expect(() => authoredFloorPlan(missing)).toThrow("uncovered floor cells")
  const outside = structuredClone(source)
  outside.rooms = outside.rooms.map((r, i) => (i === 0 ? { ...r, furniture: r.furniture.map((f, k) => (k === 0 ? { ...f, rect: [99, 1, 1, 1] } : f)) } : r))
  expect(() => authoredFloorPlan(outside)).toThrow("Invalid authored furniture")
})

it("requires a real foundation slab and rejects an upper floor crossing its ceiling", () => {
  const noFoundation = structuredClone(building)
  delete noFoundation.foundation
  expect(() => compileAuthoredPlan(noFoundation, documents)).toThrow("floor thickness")
  const source = compileAuthoredPlan(building, documents)
  source.floorLevels = source.floorLevels.map((l) => (l.floor === 1 ? { ...l, thickness: 0.8 } : l))
  expect(() => authoredFloorPlan(source)).toThrow("floor thickness")
})

it.each([
  undefined,
  { width_m: 0.7, depth_m: 0.4, height_m: 0.44, back_height_m: 0.9, board_thickness_m: 0.04, leg_width_m: 0.04 },
  { width_m: 0.4, depth_m: 0.4, height_m: 0.03, back_height_m: 0.9, board_thickness_m: 0.04, leg_width_m: 0.04 },
])("rejects a classroom chair without usable physical dimensions: %j", (seat) => {
  const rooms = structuredClone(documents)
  const chair = rooms.flatMap((room) => room.furniture ?? []).find((piece) => piece.runtime_kind === "chair")!
  chair.seat = seat
  expect(() => compileAuthoredPlan(building, rooms)).toThrow(/chair dimensions/)
})

it("audits every adopted room and detects a table that leaves too little space above the chair", async () => {
  for (const room of documents) expect(auditRoomGrid(room)).toEqual([])
  const rooms = structuredClone(documents),
    room = rooms.find((room) => room.furniture?.some((f) => f.symbol === "A"))!
  const table = room.furniture!.find((f) => f.symbol === "A")!
  table.work_surface!.height_m = 0.6
  expect(auditRoomGrid(room)).toContain("A: insufficient knee clearance above a")
  expect(() => compileAuthoredPlan(building, rooms)).toThrow(/insufficient knee clearance/)
})

it("rejects an extended foot board without its assigned table and detects a table leg in its path", async () => {
  const room = structuredClone(documents.find((room) => room.id === "room-h-m5-1")!)
  const chair = room.furniture!.find((piece) => piece.symbol === "a")!,
    table = room.furniture!.find((piece) => piece.symbol === "A")!
  chair.seat!.foot_rest!.under_table = "missing"
  expect(auditRoomGrid(room)).toContain("a: extended foot rest has no assigned table")
  chair.seat!.foot_rest!.under_table = "A"
  table.work_surface!.leg_inset_m = 0.08
  expect(auditRoomGrid(room)).toContain("a: foot rest meets table leg")
})

it("rejects two simultaneous assignments for the same pupil instead of silently taking the first", () => {
  const rooms = structuredClone(documents)
  const room = rooms.find((room) => room.id === "room-h-m5-1")!
  const classroom = room.classroom as { places: { resident: string; chair: string }[] }
  classroom.places.push({ ...classroom.places[0] })
  expect(() => compileAuthoredPlan(building, rooms)).toThrow(/Duplicate activity place/)
})

it("detects a table leg touching only the foot-rest bearer, beyond the foot board", async () => {
  const room = structuredClone(documents.find((room) => room.id === "room-h-m5-1")!)
  room.furniture!.find((piece) => piece.symbol === "A")!.work_surface!.leg_inset_m = 0.031
  const problems = auditRoomGrid(room)
  expect(problems).toContain("a: foot rest bearer meets table leg")
  expect(problems).not.toContain("a: foot rest meets table leg")
})

it("rejects entrances that cross a corner or disagree with the authored door cells", () => {
  const source = structuredClone(generated)
  source.entry = [0.5, source.depth - 1]
  expect(() => authoredFloorPlan(source)).toThrow("must fit one exterior wall")
  source.entry = [8.5, source.depth - 1]
  expect(() => authoredFloorPlan(source)).toThrow("disagrees with doorway cells")
})
