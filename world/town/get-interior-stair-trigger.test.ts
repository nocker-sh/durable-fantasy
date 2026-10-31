import { expect, it } from "vitest"
import { getInteriorStairTrigger } from "#/world/town/get-interior-stair-trigger"
import { INTERIORS } from "#/world/town/interiors"

const room = { interior: INTERIORS[0], rows: ["...", "..."] }
const flight = { x0: 0, z0: 0, x1: 1, z1: 1 }
it("limits a huge landing to the actual walk grid", () => {
  expect(getInteriorStairTrigger({ room, landing: { x0: 0, z0: 0, x1: Number.MAX_VALUE, z1: Number.MAX_VALUE }, flight })).toEqual([0, 0])
})
it("rejects a distant landing without enumerating its coordinate range", () => {
  expect(() => getInteriorStairTrigger({ room, landing: { x0: 1e300, z0: 1e300, x1: 1.1e300, z1: 1.1e300 }, flight })).toThrow("Stair landing has no walkable trigger")
})
it("does not use a blocked cell or a cell centre on the landing boundary", () => {
  expect(() => getInteriorStairTrigger({ room: { ...room, rows: ["#."] }, landing: { x0: 0, z0: 0, x1: 0.75, z1: 0.5 }, flight })).toThrow("Stair landing has no walkable trigger")
})
