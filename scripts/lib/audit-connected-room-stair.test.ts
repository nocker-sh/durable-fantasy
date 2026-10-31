import { expect, it } from "vitest"
import { auditConnectedRoomStair } from "#/scripts/lib/audit-connected-room-stair"
import type { SettingDocument } from "#/scripts/lib/setting-document"

function room(id: string, floor: number, rect: number[]): SettingDocument {
  return {
    id,
    floor,
    kind: "rooms",
    title: id,
    source: "test",
    status: "設計中",
    design_gate: "未通過",
    issues: [],
    furniture: [{ symbol: "S", name: "階段", owner: "世帯", source: "大工", rect, access: [[2, 2]] }],
  }
}
function fixture() {
  return {
    room: room("lower", 0, [2, 1, 1, 1]),
    target: room("upper", 1, [0, 0, 1, 1]),
    origin: [1, 1] satisfies [number, number],
    targetOrigin: [3, 2] satisfies [number, number],
    connection: { kind: "stair", target: "upper", furniture: "S", target_furniture: "S", access: [2, 2] satisfies [number, number], target_access: [2, 2] satisfies [number, number] },
  }
}
it("compares the stair footprints in building coordinates and retains authored metadata", () => {
  const request = fixture(),
    original = structuredClone(request)
  expect(auditConnectedRoomStair(request)).toEqual([])
  expect(request).toEqual(original)
})
it("rejects shifted stair footprints and nonadjacent floors", () => {
  const request = fixture()
  request.targetOrigin[0]++
  expect(auditConnectedRoomStair(request)).toContain("lower: stairs do not align between adjacent floors")
  request.targetOrigin[0]--
  request.target.floor = 2
  expect(auditConnectedRoomStair(request)).toContain("lower: stairs do not align between adjacent floors")
})
it("does not coerce an authored floor string into a physical floor number", () => {
  const request = fixture()
  request.target.floor = "1"
  expect(auditConnectedRoomStair(request)).toContain("lower: stairs do not align between adjacent floors")
})
it("requires both endpoints to be furniture use positions", () => {
  const request = fixture()
  request.connection.target_access[0]++
  expect(auditConnectedRoomStair(request)).toEqual(["lower: stair endpoints are not furniture use positions"])
})
it.each([{ furniture: [null] }, { furniture: [{ symbol: "S", rect: null, access: [] }] }, { furniture: [{ symbol: "S", rect: [0, 0, 1, 1], access: null }] }])(
  "rejects malformed stair furniture without throwing: %j",
  (invalid) => {
    const request = fixture()
    Object.assign(request.target, invalid)
    expect(auditConnectedRoomStair(request)).toEqual(["lower: invalid stair furniture"])
  },
)
