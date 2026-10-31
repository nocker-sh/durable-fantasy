import { expect, it } from "vitest"
import { isRoomPassageConnected } from "#/scripts/lib/is-room-passage-connected"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Connection } from "#/scripts/lib/building-layout"

function fixture() {
  const connection: Connection = { kind: "stair", target: "upper", furniture: "S", target_furniture: "S", access: [2, 1], target_access: [2, 1] }
  const room: SettingDocument = {
    id: "lower",
    kind: "rooms",
    title: "lower",
    source: "test",
    status: "設計中",
    design_gate: "未通過",
    issues: [],
    building: "building",
    floor: 0,
    origin: [0, 0],
    grid: { cell_m: 1, rows: ["####", "#S.#", "#..#", "####"] },
    furniture: [{ symbol: "S", name: "階段", owner: "世帯", source: "大工", rect: [1, 1, 1, 1], access: [[2, 1]] }],
    connections: [connection],
  }
  const reverse: Connection = { ...structuredClone(connection), target: "lower" }
  const upper: SettingDocument = { ...structuredClone(room), id: "upper", floor: 1, connections: [reverse] }
  const building = { ...room, id: "building", kind: "buildings", rooms: [room.id, upper.id] }
  return {
    building,
    room,
    connection,
    documents: new Map([
      [room.id, room],
      [upper.id, upper],
    ]),
    cellMetres: 1,
    reverse,
  }
}
it("accepts stairs whose two declarations have valid furniture endpoints", () => {
  const request = fixture(),
    original = structuredClone(request)
  expect(isRoomPassageConnected(request)).toBe(true)
  expect(request).toEqual(original)
})
it("rejects a stair when only the returning declaration names an invalid use position", () => {
  const request = fixture()
  request.reverse.access = [99, 99]
  expect(isRoomPassageConnected(request)).toBe(false)
})
