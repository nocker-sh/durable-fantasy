import { expect, it } from "vitest"
import { getInteriorStairArrival } from "#/world/town/get-interior-stair-arrival"
import { INTERIORS } from "#/world/town/interiors"
import type { InteriorStairRoom, InteriorStairEndpoint } from "#/world/town/interior-stair-types"

const room: InteriorStairRoom = { interior: { ...INTERIORS[0], floor: 1, door: [2, 0] }, rows: Array.from({ length: 5 }, () => ".....") }
const endpoints: readonly InteriorStairEndpoint[] = [{ map: room.interior.id, at: [2, 2], targetMap: "other", targetAt: [2, 2] }]
it("retains breadth-first tie order on an upper floor", () => {
  expect(getInteriorStairArrival({ room, start: [2, 2], endpoints })).toEqual([2, 0])
})
it("also stays clear of the street door on the ground floor", () => {
  expect(getInteriorStairArrival({ room: { ...room, interior: { ...room.interior, floor: 0 } }, start: [2, 2], endpoints })).toEqual([4, 2])
})
it("rejects a landing with no reachable safe arrival", () => {
  expect(() => getInteriorStairArrival({ room: { ...room, rows: ["#####", "#####", "##.##", "#####", "#####"] }, start: [2, 2], endpoints })).toThrow("Stair landing has no safe arrival")
})
