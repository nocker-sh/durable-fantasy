import { expect, it } from "vitest"
import { getAuthoredRoomSpace } from "#/world/town/floorplan/get-authored-room-space"
import proposal from "#/world/town/floorplan/authored/h-m5"
import type { AuthoredRoom } from "#/world/town/floorplan/authored-types"

const fixture = (): AuthoredRoom => ({ ...proposal.rooms[0], id: "room", floor: 0, origin: [2, 3], rows: ["######", "#A..##", "##..DD", "######"] })
it("keeps the metric interior shape and identity without walls or shared doorways", () => {
  const room = fixture(),
    original = structuredClone(room)
  expect(getAuthoredRoomSpace(room, proposal)).toEqual({
    id: "room",
    footprint: [
      { x0: 1.5, z0: 2, x1: 3, z1: 2.5 },
      { x0: 2, z0: 2.5, x1: 3, z1: 3 },
    ],
  })
  expect(room).toEqual(original)
})
it("closes a strip at the actual end of a row", () => {
  expect(getAuthoredRoomSpace({ ...fixture(), origin: [0, 0], rows: [".A"] }, proposal).footprint).toEqual([{ x0: 0, z0: 0, x1: 1, z1: 0.5 }])
})
it("does not invent usable area for walls and portals only", () => {
  expect(getAuthoredRoomSpace({ ...fixture(), rows: ["##DD"] }, proposal).footprint).toEqual([])
})
it.each(["ragged", "origin", "floor"])("rejects invalid %s before projecting cells", (invalid) => {
  const room = fixture()
  if (invalid === "ragged") room.rows = ["##", "#"]
  if (invalid === "origin") room.origin = [0.5, 0]
  if (invalid === "floor") room.floor = -1
  expect(() => getAuthoredRoomSpace(room, proposal)).toThrow("Invalid authored room")
})
it.each([0, Infinity, NaN])("rejects invalid physical cell size %s", (cellM) => {
  expect(() => getAuthoredRoomSpace(fixture(), { ...proposal, cellM })).toThrow("Invalid authored plan dimensions")
})
