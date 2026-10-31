import { expect, it } from "vitest"
import { assertMapRoomSeparation } from "#/world/maps/assert-map-room-separation"
import type { MapSpace, MapSpaceRegistry } from "#/world/maps/map-space-types"

const a = { x0: 1, z0: 1, x1: 3, z1: 2 }
const space = (): MapSpace => ({
  parentMap: "outside",
  frame: { origin: [100, 5, 200], width: 4, depth: 6, quarterTurns: 0 },
  planarOrigin: [0, 0],
  metresPerPlanarUnit: 1,
  rooms: [{ id: "room", footprint: [a] }],
})
const registry = (other: MapSpace): MapSpaceRegistry => ({ outside: { id: "outside" }, elsewhere: { id: "elsewhere" }, first: { id: "first", space: space() }, second: { id: "second", space: other } })
const rotations = [
  { turn: 0, bounds: a },
  { turn: 1, bounds: { x0: 2, z0: 1, x1: 3, z1: 3 } },
  { turn: 2, bounds: { x0: 1, z0: 4, x1: 3, z1: 5 } },
  { turn: 3, bounds: { x0: 1, z0: 3, x1: 2, z1: 5 } },
]
it.each(rotations)("rejects coincident parent-space room areas after quarter turn $turn", (input) => {
  const placement = space(),
    maps = registry({ ...placement, frame: { ...placement.frame, quarterTurns: input.turn }, rooms: [{ id: "room", footprint: [input.bounds] }] }),
    original = structuredClone(maps)
  expect(() => assertMapRoomSeparation(maps)).toThrow("Map room planes overlap: first / room and second / room")
  expect(maps).toEqual(original)
})
it("allows boundary contact between different maps without moving either room", () => {
  const maps = registry({ ...space(), rooms: [{ id: "adjacent", footprint: [{ x0: 3, z0: 1, x1: 4, z1: 2 }] }] }),
    original = structuredClone(maps)
  expect(() => assertMapRoomSeparation(maps)).not.toThrow()
  expect(maps).toEqual(original)
})
it("compares actual strips rather than the outer bounds of a concave room", () => {
  const first = { ...space(), rooms: [{ id: "concave", footprint: [a, { x0: 1, z0: 2, x1: 2, z1: 4 }] }] }
  const second = { ...space(), rooms: [{ id: "in-gap", footprint: [{ x0: 2, z0: 2, x1: 3, z1: 4 }] }] }
  expect(() => assertMapRoomSeparation({ outside: { id: "outside" }, first: { id: "first", space: first }, second: { id: "second", space: second } })).not.toThrow()
})
it("does not compare coordinates belonging to different roots", () => {
  expect(() => assertMapRoomSeparation(registry({ ...space(), parentMap: "elsewhere" }))).not.toThrow()
})
it("leaves different floor elevations to the separate volume design", () => {
  const placement = space()
  expect(() => assertMapRoomSeparation(registry({ ...placement, frame: { ...placement.frame, origin: [100, 5.001, 200] } }))).not.toThrow()
})
it("uses parent-space translation rather than comparing identical local cell numbers", () => {
  const placement = space()
  expect(() => assertMapRoomSeparation(registry({ ...placement, frame: { ...placement.frame, origin: [120, 5, 200] } }))).not.toThrow()
})
it("does not substitute an entire frame for missing room geometry", () => {
  expect(() => assertMapRoomSeparation(registry({ ...space(), rooms: undefined }))).not.toThrow()
})
