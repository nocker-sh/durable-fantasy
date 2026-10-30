import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { z } from "zod"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditRoomGrid } from "#/scripts/lib/audit-room-grid"
import { auditBuildingLayout } from "#/scripts/lib/audit-building-layout"
import { auditFurnitureUse } from "#/scripts/lib/furniture-use"
import { auditRoomClearance } from "#/scripts/lib/room-clearance"
import { auditPrivateRoomAccess } from "#/scripts/lib/private-room-access"
import { auditHouseholdMeals } from "#/scripts/lib/household-meals"
import { auditSleepingPlaces } from "#/scripts/lib/sleeping-places"
import { auditPersonalStorage } from "#/scripts/lib/personal-storage"
import type { SettingDocument } from "#/scripts/lib/setting-document"

function fixture() {
  const paths = [
    "buildings/building-hue-ludwig",
    "maps/map-hue-quarter",
    "towns/town-hue",
    "residents/resident-ルードヴィヒ",
    ...["1", "2", "hall", "wash", "toilet", "fuel"].map((suffix) => `rooms/room-hue-ludwig-${suffix}`),
  ]
  const documents = new Map(
    paths.map((path) => {
      const document = readSetting(readFileSync(`.docs/settings/${path}.md`, "utf8"))
      return [document.id, document]
    }),
  )
  const building = documents.get("building-hue-ludwig"),
    hall = documents.get("room-hue-ludwig-hall"),
    wash = documents.get("room-hue-ludwig-wash"),
    fuel = documents.get("room-hue-ludwig-fuel")
  if (!building || !hall || !wash || !fuel) throw new Error("Missing authored household layout")
  return { documents, building, hall, wash, fuel, rooms: [...documents.values()].filter((document) => document.kind === "rooms") }
}

function movePiece(room: SettingDocument, symbol: string, rectangle: readonly [number, number, number, number]) {
  const piece = room.furniture?.find((piece) => piece.symbol === symbol),
    grid = room.grid
  if (!piece || !grid) throw new Error("Missing authored piece")
  const rows = grid.rows.map((row) => [...row.replaceAll(symbol, ".")])
  piece.rect = [...rectangle]
  for (const y of Array.from({ length: rectangle[3] }).keys()) for (const x of Array.from({ length: rectangle[2] }).keys()) rows[rectangle[1] + y][rectangle[0] + x] = symbol
  grid.rows = rows.map((row) => row.join(""))
}

it("assembles every room and doorway in one floor while keeping the proposed home out of runtime", () => {
  const source = fixture(),
    before = JSON.stringify([...source.documents])
  expect(source.rooms).toHaveLength(6)
  expect(auditBuildingLayout(source.building, source.documents)).toEqual([])
  expect(auditPrivateRoomAccess(source.building, source.documents)).toEqual([])
  for (const room of source.rooms) {
    expect(auditRoomGrid(room)).toEqual([])
    expect(auditFurnitureUse(room)).toEqual([])
    expect(auditRoomClearance(room)).toEqual([])
    expect(room.design_gate).toBe("未通過")
  }
  expect(JSON.stringify([...source.documents])).toBe(before)
})

it("assigns the owner's dining chair, ordinary bed and personal storage without reusing guest or work furniture", () => {
  const source = fixture()
  expect(auditHouseholdMeals(source.documents)).toEqual([])
  expect(auditSleepingPlaces(source.documents)).toEqual([])
  expect(auditPersonalStorage(source.documents)).toEqual([])
})

it("rejects the earlier drying-rack position that passes point reachability but blocks a body-sized route", () => {
  const source = fixture()
  movePiece(source.wash, "R", [4, 3, 2, 2])
  expect(auditRoomGrid(source.wash)).toEqual([])
  expect(auditFurnitureUse(source.wash)).toEqual([])
  expect(auditRoomClearance(source.wash)).toContain("W: insufficient clearance to use position")
})

it("keeps the full tool footprint out of the two-cell rear doorway", () => {
  const source = fixture()
  movePiece(source.fuel, "T", [6, 4, 1, 2])
  const tools = source.fuel.furniture?.find((piece) => piece.symbol === "T")
  if (!tools) throw new Error("Missing authored tools")
  tools.access = [[5, 4]]
  tools.use_space = [{ activity: "灰の専用の道具を取り出す", rect: [4, 3, 2, 3] }]
  expect(auditFurnitureUse(source.fuel)).toEqual([])
  expect(auditRoomGrid(source.fuel)).toEqual([])
  expect(auditRoomClearance(source.fuel)).toContain("Insufficient clearance to entry at 7,3")
})

it("requires reciprocal room connections rather than accepting disconnected doorway drawings", () => {
  const source = fixture()
  source.hall.connections = []
  expect(auditBuildingLayout(source.building, source.documents)).toContain("room-hue-ludwig-2: connection to room-hue-ludwig-hall is not reciprocal")
})

it("rejects giving both rooms a separate leaf on one shared doorway", () => {
  const source = fixture()
  const leaves = z.array(z.unknown()).parse(source.hall.door_leaves)
  source.hall.door_leaves = [...leaves, { door: [3, 0], hinge: "end", frame_inset_m: 0.025, thickness_m: 0.04, waits_for: [] }]
  expect(auditBuildingLayout(source.building, source.documents)).toContain("Door portal 0:h:3,6:2: missing or duplicate physical ownership")
})
