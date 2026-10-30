import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { parkedCartDepartureSchema } from "#/scripts/lib/parked-cart-departure-schema"
import { getParkedCartDepartureError } from "#/scripts/lib/get-parked-cart-departure-error"

function fixture() {
  const room = readSetting(readFileSync(".docs/settings/rooms/room-barn-2.md", "utf8"))
  const operator = readSetting(readFileSync(".docs/settings/residents/resident-カール.md", "utf8")),
    map = readSetting(readFileSync(".docs/settings/maps/map-phanthiet.md", "utf8"))
  const documents = new Map([room, operator, map].map((document) => [document.id, document]))

  return { room, documents, plan: parkedCartDepartureSchema.parse(room.parked_cart_departure) }
}

it("sweeps the real cart bay, complete south doorway and reserved apron with the trailing operator", () => {
  const source = fixture(),
    before = JSON.stringify([...source.documents])
  expect(getParkedCartDepartureError(source.room, source.documents)).toBeNull()
  expect(JSON.stringify([...source.documents])).toBe(before)
})

it("does not teleport from the bay or certify an endpoint while the operator remains indoors", () => {
  const source = fixture()
  source.room.parked_cart_departure = {
    ...source.plan,
    points_m: [
      [1.5, 7],
      [1.5, 11.25],
    ],
  }
  expect(getParkedCartDepartureError(source.room, source.documents)?.message).toContain("parked position")
  source.room.parked_cart_departure = {
    ...source.plan,
    points_m: [
      [1.5, 6.25],
      [1.5, 10.5],
    ],
  }
  expect(getParkedCartDepartureError(source.room, source.documents)?.message).toContain("remains inside")
})

it("rejects sideways moves, repeated points and reversing direction rather than inventing wheel motion", () => {
  const source = fixture()
  for (const middle of [
    [1.6, 7],
    [1.5, 6.25],
    [1.5, 6],
  ]) {
    source.room.parked_cart_departure = { ...source.plan, points_m: [source.plan.points_m[0], middle, source.plan.points_m[1]] }
    expect(getParkedCartDepartureError(source.room, source.documents)?.message).toContain("without sideways motion")
  }
})

it("checks obstacles between clear endpoints and vacates only this moving cart's bay", () => {
  const source = fixture()
  if (!source.room.grid) throw new Error("Missing grid")
  source.room.grid.rows[15] = "#A.........#"
  expect(getParkedCartDepartureError(source.room, source.documents)?.message).toContain("blocked grid cell")
})

it("keeps the open fitted panel in the exit rather than checking only nominal door width", () => {
  const source = fixture()
  const fittings = { brace_projection_m: 0.015, handle_projection_m: 0.025 }
  source.room.door_leaves = [
    { door: [0, 8], hinge: "start", frame_inset_m: 0.05, thickness_m: 0.04, fittings, waits_for: [] },
    { door: [1, 17], hinge: "start", frame_inset_m: 0.4, thickness_m: 0.04, fittings, waits_for: [] },
  ]
  expect(getParkedCartDepartureError(source.room, source.documents)?.message).toContain("fitted doorway")
})

it("does not overlook an obstacle touched only by the operator before the cart starts moving", () => {
  const source = fixture()
  if (!source.room.grid) throw new Error("Missing grid")
  const row = [...source.room.grid.rows[8]]
  row[2] = "A"
  source.room.grid.rows[8] = row.join("")
  expect(getParkedCartDepartureError(source.room, source.documents)?.message).toContain("Moving footprint intersects")
})

it("does not omit panel thickness or projecting fittings from the movement review", () => {
  const source = fixture()
  source.room.door_leaves = [{ door: [1, 17], hinge: "start", frame_inset_m: 0.05, waits_for: [] }]
  expect(getParkedCartDepartureError(source.room, source.documents)?.message).toContain("complete fitted panels")
})

it("rejects an apron detached from the door or too short for the entire departure", () => {
  const source = fixture()
  source.room.parked_cart_departure = { ...source.plan, exterior_apron: { status: "unassigned", rect_m: [0.5, 9.5, 2, 4] } }
  expect(getParkedCartDepartureError(source.room, source.documents)?.message).toContain("does not adjoin")
  source.room.parked_cart_departure = { ...source.plan, exterior_apron: { status: "unassigned", rect_m: [0.5, 9, 2, 2] } }
  expect(getParkedCartDepartureError(source.room, source.documents)?.message).toContain("blocked grid cell")
})

it("requires the maintained local operator and does not turn an unassigned plan into a completed room", () => {
  const source = fixture()
  source.documents.delete("resident-カール")
  expect(getParkedCartDepartureError(source.room, source.documents)?.message).toContain("operator dependency")
  source.room.design_gate = "通過"
  expect(getParkedCartDepartureError(source.room, source.documents)?.message).toContain("Invalid proposed")
})
