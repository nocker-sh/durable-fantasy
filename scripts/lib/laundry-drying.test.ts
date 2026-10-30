import { expect, it } from "vitest"
import { auditLaundryDrying } from "#/scripts/lib/laundry-drying"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const base = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, source: "test", status: "設計中", design_gate: "未通過", issues: [] })
function fixture() {
  const resident = base("resident-a", "residents"),
    home = { ...base("building-a", "buildings"), residents: [resident.id] }
  const room: SettingDocument = {
    ...base("room-a", "rooms"),
    building: home.id,
    occupants: [resident.title],
    grid: { cell_m: 0.5, rows: ["######", "#RR..#", "#RR..#", "#....#", "##DD##"] },
    furniture: [{ symbol: "R", role: "drying_rack", name: "物干し", owner: resident.title, source: "大工", rect: [1, 1, 2, 2], access: [[3, 1]] }],
    laundry_drying: { racks: [{ furniture: "R", handler: resident.id }], capacity_status: "unverified" },
  }
  return { room, home, resident, documents: new Map<string, SettingDocument>([resident, home, room].map((d) => [d.id, d])) }
}
it("allows an explicit placed draft without pretending its capacity is known", () => {
  expect(auditLaundryDrying(fixture().documents)).toEqual([])
})
it("does not pass a drying room with unverified capacity", () => {
  const f = fixture()
  f.room.design_gate = "通過"
  expect(auditLaundryDrying(f.documents)).toContain("room-a: Drying capacity and operation remain unverified")
})
it("does not count a bed or empty symbol as hanging cloth", () => {
  const f = fixture()
  f.room.furniture![0].role = "bed"
  expect(auditLaundryDrying(f.documents)).toContain("room-a: Drying rack has no matching occupied furniture")
})
it("requires a handler belonging to the room's household", () => {
  const f = fixture()
  f.home.residents = []
  expect(auditLaundryDrying(f.documents)).toContain("room-a: Drying handler does not belong to the home and room")
})
it("does not leave physical racks unassigned or count a rack twice", () => {
  const f = fixture()
  f.room.laundry_drying = { racks: [], capacity_status: "unverified" }
  expect(auditLaundryDrying(f.documents)).toContain("room-a: Drying rack has no assigned handler")
  f.room.laundry_drying = {
    racks: [
      { furniture: "R", handler: f.resident.id },
      { furniture: "R", handler: f.resident.id },
    ],
    capacity_status: "unverified",
  }
  expect(auditLaundryDrying(f.documents)).toContain("room-a: Drying rack is assigned more than once")
})
it("does not overlook occupied drying furniture when its plan is omitted", () => {
  const f = fixture()
  delete f.room.laundry_drying
  expect(auditLaundryDrying(f.documents)).toContain("room-a: Drying rack has no drying plan")
})
