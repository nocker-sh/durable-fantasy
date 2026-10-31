import { expect, it } from "vitest"
import { getRoomSiteRectangle } from "#/scripts/lib/get-room-site-rectangle"
import type { SettingDocument } from "#/scripts/lib/setting-document"

function fixture() {
  const room: SettingDocument = {
    id: "room",
    kind: "rooms",
    title: "room",
    source: "test",
    status: "設計中",
    design_gate: "未通過",
    issues: [],
    building: "building",
    floor: 0,
    origin: [0, 0],
    grid: { cell_m: 1, rows: ["###", "#.#", "###"] },
  }
  const building: SettingDocument = { ...room, id: "building", kind: "buildings", rooms: [room.id], layout: { cell_m: 1, width: 4, depth: 3 }, site_plan: { origin: [0, 0], rotation_quarters: 0 } }
  return { building, room, rect: [0, 0, 2, 1] satisfies [number, number, number, number], metresPerTile: 1 }
}
it("retains ordinary projected bounds and authored metadata", () => {
  const request = fixture(),
    original = structuredClone(request)
  expect(getRoomSiteRectangle(request)).toEqual([0, 0, 2, 1])
  expect(request).toEqual(original)
})
it("returns the existing domain error when finite inputs overflow during projection", () => {
  const request = fixture()
  request.building.site_plan = { origin: [Number.MAX_VALUE, 0], rotation_quarters: 0 }
  request.rect = [Number.MAX_VALUE, 0, Number.MAX_VALUE, 1]
  const rectangle = getRoomSiteRectangle(request)
  expect(rectangle).toBeInstanceOf(Error)
  if (!(rectangle instanceof Error)) throw new Error("Expected a rejected rectangle")
  expect(rectangle.message).toBe("Unbounded room site rectangle")
})
