import { expect, it } from "vitest"
import { assertMapRoomSpaces } from "#/world/maps/assert-map-room-spaces"
import type { MapSpace } from "#/world/maps/map-space-types"
import type { Rect } from "#/world/town/floorplan/types"

const fixture = (): MapSpace => ({ parentMap: "parent", frame: { origin: [100, 5, 200], width: 8, depth: 6, quarterTurns: 1 }, planarOrigin: [0, 0], metresPerPlanarUnit: 1 })
const a = { x0: 1, z0: 1, x1: 3, z1: 2 }
it("allows boundary contact without widening the frame or mutating room strips", () => {
  const space = {
      ...fixture(),
      rooms: [
        { id: "a", footprint: [a] },
        { id: "b", footprint: [{ x0: 3, z0: 1, x1: 8, z1: 6 }] },
      ],
    },
    original = structuredClone(space)
  expect(() => assertMapRoomSpaces(space)).not.toThrow()
  expect(space).toEqual(original)
})
it("does not replace a concave room with its bounding rectangle", () => {
  const rooms = [
    { id: "a", footprint: [a, { x0: 1, z0: 2, x1: 2, z1: 4 }] },
    { id: "b", footprint: [{ x0: 2, z0: 2, x1: 3, z1: 4 }] },
  ]
  expect(() => assertMapRoomSpaces({ ...fixture(), rooms })).not.toThrow()
})
it.each(["same-room", "different-room"])("rejects positive area overlap in %s", (kind) => {
  const b = { ...a, x0: 2, x1: 4 }
  const rooms =
    kind === "same-room"
      ? [{ id: "a", footprint: [a, b] }]
      : [
          { id: "a", footprint: [a] },
          { id: "b", footprint: [b] },
        ]
  expect(() => assertMapRoomSpaces({ ...fixture(), rooms })).toThrow("footprints overlap")
})
it.each(["duplicate-id", "empty-id", "empty-shape"])("rejects %s instead of silently discarding room identity", (kind) => {
  const rooms =
    kind === "empty-shape"
      ? [{ id: "a", footprint: [] }]
      : [
          { id: kind === "empty-id" ? "" : "a", footprint: [a] },
          { id: "a", footprint: [{ ...a, x0: 4, x1: 5 }] },
        ]
  expect(() => assertMapRoomSpaces({ ...fixture(), rooms })).toThrow("Invalid map room space")
})
const invalid: readonly Rect[] = [
  { ...a, x0: -1 },
  { ...a, x1: 9 },
  { ...a, z1: 7 },
  { ...a, z0: -1 },
  { ...a, x0: NaN },
  { ...a, x1: Infinity },
  { ...a, x1: 1 },
  { ...a, z1: 1 },
]
it.each(invalid.map((rect) => ({ rect })))("rejects invalid or out-of-frame geometry: %j", (input) => {
  expect(() => assertMapRoomSpaces({ ...fixture(), rooms: [{ id: "a", footprint: [input.rect] }] })).toThrow("footprint is outside its frame")
})
it("leaves unspecified room geometry unverified", () => {
  expect(() => assertMapRoomSpaces(fixture())).not.toThrow()
})

it("rejects an invalid containing frame instead of accepting comparisons with NaN", () => {
  const space = fixture()
  expect(() => assertMapRoomSpaces({ ...space, frame: { ...space.frame, width: NaN }, rooms: [{ id: "a", footprint: [a] }] })).toThrow("Invalid spatial frame dimensions")
})
