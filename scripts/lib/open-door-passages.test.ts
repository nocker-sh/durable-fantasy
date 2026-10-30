import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { z } from "zod"
import { readSetting } from "#/scripts/lib/read-setting"
import { openDoorPassagesSchema } from "#/scripts/lib/open-door-passages-schema"
import { doorLeafGeometrySchema } from "#/scripts/lib/door-leaf-geometry-schema"
import { auditOpenDoorPassages } from "#/scripts/lib/audit-open-door-passages"
import { getRoomOpenDoorObstacles } from "#/scripts/lib/get-room-open-door-obstacles"
import { getRoomDoorThreshold } from "#/scripts/lib/get-room-door-threshold"
import { getOpenDoorPolylineError } from "#/scripts/lib/get-open-door-polyline-error"
import { getDoorFrameBoxes } from "#/scripts/lib/get-door-frame-boxes"
import { MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"

function fixture(suffix = "1") {
  const building = readSetting(readFileSync(".docs/settings/buildings/building-hue-ludwig.md", "utf8")),
    ids = z.array(z.string()).parse(building.rooms)
  const rooms = ids.map((id) => readSetting(readFileSync(`.docs/settings/rooms/${id}.md`, "utf8"))),
    documents = new Map([building, ...rooms].map((document) => [document.id, document])),
    room = documents.get(`room-hue-ludwig-${suffix}`)
  if (!room) throw new Error("Missing authored room")
  const plan = openDoorPassagesSchema.parse(room.open_door_passages)
  room.open_door_passages = plan
  return { room, rooms, building, documents, plan }
}

it("connects every doorway to its room hub while keeping every fitted leaf open", () => {
  const source = fixture(),
    before = JSON.stringify([...source.documents])
  for (const room of source.rooms) {
    expect(auditOpenDoorPassages(room, source.documents)).toEqual([])
    expect(openDoorPassagesSchema.parse(room.open_door_passages).body_radius_m * 2).toBeGreaterThanOrEqual(MIN_PASSAGE_WIDTH_M)
  }
  expect(JSON.stringify([...source.documents])).toBe(before)
})

it("rejects the old kitchen hinge that passes the leaf-free grid but blocks the passage", () => {
  const source = fixture(),
    leaves = z.array(doorLeafGeometrySchema).parse(source.room.door_leaves)
  source.room.door_leaves = leaves.map((leaf) => ({ ...leaf, hinge: "end" }))
  expect(getOpenDoorPolylineError({ room: source.room, points: source.plan.entries[0].points_m, bodyRadius: source.plan.body_radius_m, obstacles: [] })).toBeNull()
  expect(auditOpenDoorPassages(source.room, source.documents)).toContain("room-hue-ludwig-1: Door 3,6: Open passage intersects a fitted door leaf")
})

it("does not certify only route endpoints while crossing the cooker in the middle", () => {
  const source = fixture()
  source.plan.entries[0].points_m = [[2, 3], [2, 1], [4, 1], source.plan.hub_m]
  expect(auditOpenDoorPassages(source.room, source.documents)).toContain("room-hue-ludwig-1: Door 3,6: Moving footprint intersects a blocked grid cell")
})

it("resolves the frame owned by the neighbouring room and refuses an oversized body", () => {
  const source = fixture("hall"),
    threshold = getRoomDoorThreshold({ ...source, door: [3, 0] })
  if (threshold instanceof Error) throw threshold
  expect(threshold.point).toEqual([2, 0.5])
  expect(threshold.clearWidth).toBeCloseTo(0.86)
  expect(threshold.frames).toEqual([
    [1.5, 0, 1.525, 0.5],
    [2.475, 0, 2.5, 0.5],
  ])
  source.plan.body_radius_m = 0.44
  expect(auditOpenDoorPassages(source.room, source.documents)).toContain("room-hue-ludwig-hall: Door 3,0: Open passage body exceeds its fitted aperture")
})

it("checks side jambs along the path rather than only measuring the threshold centre", () => {
  const source = fixture("wash"),
    points = [
      [2, 0.5],
      [1.915, 0.48],
    ] satisfies [number, number][],
    obstacles = getRoomOpenDoorObstacles(source)
  if (obstacles instanceof Error) throw obstacles
  expect(getOpenDoorPolylineError({ room: source.room, points, bodyRadius: 0.4, obstacles: [] })).toBeNull()
  expect(getOpenDoorPolylineError({ room: source.room, points, bodyRadius: 0.4, obstacles })).toEqual(new Error("Open passage intersects a fitted door frame"))
})

it("refuses shrinking the circle or omitting and duplicating doorway routes", () => {
  const source = fixture("hall")
  source.plan.body_radius_m = 0.2
  expect(auditOpenDoorPassages(source.room, source.documents)).toContain("room-hue-ludwig-hall: Open passage body is smaller than the design width")
  source.plan.body_radius_m = 0.4
  source.plan.entries = source.plan.entries.slice(1)
  expect(auditOpenDoorPassages(source.room, source.documents)).toContain("room-hue-ludwig-hall: Open passages do not cover every doorway exactly once")
  source.plan.entries.push(source.plan.entries[0])
  expect(auditOpenDoorPassages(source.room, source.documents)).toContain("room-hue-ludwig-hall: Open passages do not cover every doorway exactly once")
})

it("matches the declared polyline to both its actual threshold and common hub", () => {
  const source = fixture()
  source.plan.entries[0].points_m[0] = [2.1, 3]
  expect(auditOpenDoorPassages(source.room, source.documents)).toContain("room-hue-ludwig-1: Door 3,6: Open passage does not connect its threshold and room hub")
})

it("does not silently replace incomplete fitted panels with a line", () => {
  const source = fixture("2"),
    leaves = z.array(doorLeafGeometrySchema).parse(source.room.door_leaves)
  delete leaves[0].thickness_m
  source.room.door_leaves = leaves
  expect(auditOpenDoorPassages(source.room, source.documents)).toContain("room-hue-ludwig-2: Door 3,6: Open passage has no complete fitted aperture")
})

it("keeps the full fuel-room furniture footprints while providing the extra width", () => {
  const source = fixture("fuel")
  expect(source.room.furniture?.find((piece) => piece.symbol === "T")?.rect.slice(2)).toEqual([1, 2])
  expect(source.room.furniture?.find((piece) => piece.symbol === "A")?.rect.slice(2)).toEqual([2, 2])
  expect(source.room.furniture?.find((piece) => piece.symbol === "B")?.rect.slice(2)).toEqual([2, 2])
  expect(auditOpenDoorPassages(source.room, source.documents)).toEqual([])
})

it("models recessed side jambs and refuses an invalid frame boundary", () => {
  expect(getDoorFrameBoxes({ door: [0, 2], width: 2, cellM: 0.5, rows: 7, columns: 7, frameInset: 0.025, wallDepth: 2 })).toEqual([
    [0, 1, 1, 1.025],
    [0, 1.975, 1, 2],
  ])
  expect(getDoorFrameBoxes({ door: [6, 6], width: 2, cellM: 0.5, rows: 7, columns: 7, frameInset: 0.025, wallDepth: 1 })).toBeInstanceOf(Error)
  expect(getDoorFrameBoxes({ door: [0, 2], width: 2, cellM: 1e308, rows: 7, columns: 7, frameInset: 0.025, wallDepth: 1 })).toBeInstanceOf(Error)
})

it("does not promote a planar route to completed native operation", () => {
  const source = fixture()
  source.room.design_gate = "通過"
  expect(auditOpenDoorPassages(source.room, source.documents)).toContain("room-hue-ludwig-1: Planar open passages do not certify native operation or a completed room")
})
