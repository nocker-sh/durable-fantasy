import { expect, it } from "vitest"
import { auditGuestSleepingPlaces } from "./guest-sleeping-places"
import type { SettingDocument } from "#/scripts/lib/setting-document"
function fixture() {
  const room: SettingDocument = {
    id: "room-guest",
    kind: "rooms",
    title: "客室",
    source: "test",
    status: "設計中",
    design_gate: "未通過",
    issues: [],
    guest_capacity: 1,
    guest_sleeping_places: [{ id: "guest-bed-1", label: "客枠1", grid_symbol: "B", luggage_id: "guest-luggage-1", luggage_symbol: "L" }],
    grid: { cell_m: 0.5, rows: ["########", "#BB....#", "#BB....#", "#BB....#", "#BB....#", "#LL....#", "#......#", "###DD###"] },
    furniture: [
      { symbol: "B", role: "bed", name: "客用寝台", owner: "宿", source: "大工", rect: [1, 1, 2, 4], access: [[3, 2]] },
      { symbol: "L", role: "luggage_storage", name: "客用荷物置き", owner: "宿", source: "大工", rect: [1, 5, 2, 1], access: [[3, 5]] },
    ],
  }
  return { room, documents: new Map([[room.id, room]]) }
}
it("assigns each guest a full-sized bed and a separate luggage place", () => {
  expect(auditGuestSleepingPlaces(fixture().documents)).toEqual([])
})
it("does not treat a numeric capacity as physical guest beds", () => {
  const f = fixture()
  f.room.guest_sleeping_places = []
  expect(auditGuestSleepingPlaces(f.documents)).toContain("room-guest: guest capacity does not match individual guest places")
  expect(auditGuestSleepingPlaces(f.documents)).toContain("room-guest: bed furniture has no guest or resident assignment")
})
it("allows explicit unplaced slots in a draft without a grid, then requires placement", () => {
  const f = fixture()
  f.room.guest_sleeping_places = [{ id: "g", label: "客枠", grid_symbol: null, luggage_id: "l", luggage_symbol: null }]
  expect(auditGuestSleepingPlaces(f.documents)).toContain("room-guest: guest bed has no grid placement")
  f.room.grid = null
  expect(auditGuestSleepingPlaces(f.documents)).toEqual([])
  f.room.design_gate = "通過"
  expect(auditGuestSleepingPlaces(f.documents)).toContain("room-guest: guest luggage_storage has no grid placement")
})
it("does not reuse a resident's personal bed or storage ID", () => {
  const f = fixture()
  f.room.sleeping_places = [{ id: "guest-bed-1", grid_symbol: "B" }]
  f.room.personal_storage = [{ id: "guest-luggage-1" }]
  expect(auditGuestSleepingPlaces(f.documents)).toContain("room-guest: duplicate or missing guest bed/luggage ID")
  expect(auditGuestSleepingPlaces(f.documents)).toContain("room-guest: guest furniture is shared with another sleeping place")
})
it("does not share a bed or luggage place between two guests", () => {
  const f = fixture()
  f.room.guest_capacity = 2
  f.room.guest_sleeping_places = [
    { id: "g1", label: "一", grid_symbol: "B", luggage_id: "l1", luggage_symbol: "L" },
    { id: "g2", label: "二", grid_symbol: "B", luggage_id: "l2", luggage_symbol: "L" },
  ]
  expect(auditGuestSleepingPlaces(f.documents)).toContain("room-guest: guest furniture is shared with another sleeping place")
})
it("checks guest bed dimensions and rejects a shelf used as a bed", () => {
  const f = fixture()
  f.room.furniture![0].rect = [1, 1, 2, 2]
  expect(auditGuestSleepingPlaces(f.documents)).toContain("room-guest: guest bed is too small")
  f.room.furniture![0].role = "storage"
  expect(auditGuestSleepingPlaces(f.documents)).toContain("room-guest: guest bed furniture does not match")
})
it("rejects duplicate guest IDs across different rooms", () => {
  const f = fixture()
  const other = structuredClone(f.room)
  other.id = "room-other"
  f.documents.set(other.id, other)
  expect(auditGuestSleepingPlaces(f.documents)).toContain("room-other: duplicate or missing guest bed/luggage ID")
})
