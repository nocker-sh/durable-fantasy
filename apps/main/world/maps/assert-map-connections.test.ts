import { expect, it } from "vitest"
import { assertMapConnections } from "#/world/maps/assert-map-connections"
import { MAPS } from "#/world/maps"
import type { MapDefinition } from "#/world/maps/types"

const room = (id: string): MapDefinition => ({
  id,
  name: id,
  kind: "indoor",
  size: 5,
  rows: [".....", ".....", ".....", ".....", "....."],
  spawn: [2, 2],
  npcs: [],
  places: {},
  assets: { sprites: "" },
  warps: [],
})
const fixture = () => {
  const a = room("a"),
    b = room("b")
  a.warps = [{ at: [0, 0], to: { map: "b", at: [4, 4] } }]
  b.warps = [{ at: [0, 0], to: { map: "a", at: [4, 4] } }]
  return { a, b }
}

it("accepts the current complete registry without changing its data", () => {
  const before = structuredClone(MAPS)
  expect(() => assertMapConnections(MAPS)).not.toThrow()
  expect(MAPS).toEqual(before)
})
it.each(["missing", "constructor", "toString", "__proto__"])("rejects an unregistered destination %s", (id) => {
  const maps = fixture()
  maps.a.warps = [{ at: [0, 0], to: { map: id, at: [4, 4] } }]
  expect(() => assertMapConnections(maps)).toThrow("Map connection destination is missing or miskeyed: a -> " + id)
})
it("rejects a registry key that points at another map", () => {
  const maps = fixture()
  maps.b.id = "elsewhere"
  expect(() => assertMapConnections(maps)).toThrow(/miskeyed/)
})
it("accepts an explicitly registered destination whose name matches an inherited attribute", () => {
  const maps = fixture()
  maps.a.warps = [{ at: [0, 0], to: { map: "constructor", at: [4, 4] } }]
  maps.b.id = "constructor"
  expect(() =>
    assertMapConnections(
      Object.fromEntries([
        ["a", maps.a],
        ["constructor", maps.b],
      ]),
    ),
  ).not.toThrow()
})
it("checks the identity of an isolated map with no incoming connection", () => {
  expect(() => assertMapConnections({ a: room("b") })).toThrow("Map connection registry is miskeyed: a")
})
it.each(
  [
    [5, 4],
    [-1, 0],
    [0.5, 4],
    [Infinity, 4],
  ].map((cell) => ({ cell })),
)("rejects invalid destination coordinates %j", (input) => {
  const maps = fixture()
  maps.a.warps = [{ at: [0, 0], to: { map: "b", at: [input.cell[0], input.cell[1]] } }]
  expect(() => assertMapConnections(maps)).toThrow("Map connection arrival is blocked: a -> b")
})
it("rejects arrival on an obstacle", () => {
  const maps = fixture()
  maps.b.rows = [".....", ".....", ".....", ".....", "....#"]
  expect(() => assertMapConnections(maps)).toThrow("Map connection arrival is blocked: a -> b")
})
it("rejects arrival within the return trigger's one-cell range", () => {
  const maps = fixture()
  maps.a.warps = [{ at: [0, 0], to: { map: "b", at: [1, 1] } }]
  expect(() => assertMapConnections(maps)).toThrow("Map connection arrival touches a warp trigger: a -> b")
})
it("rejects overlapping source triggers", () => {
  const maps = fixture()
  maps.a.warps = [...maps.a.warps, ...maps.a.warps]
  expect(() => assertMapConnections(maps)).toThrow("Map connection triggers overlap: a")
})
it("rejects an incoming arrival isolated from the destination's spawn and exit", () => {
  const maps = fixture()
  maps.b.rows = [".....", ".....", ".....", "#####", "....."]
  expect(() => assertMapConnections(maps)).toThrow("Map connection cells are unreachable: b")
})
it("rejects a blocked trigger without snapping it onto nearby free ground", () => {
  const maps = fixture()
  maps.a.rows = ["#....", ".....", ".....", ".....", "....."]
  expect(() => assertMapConnections(maps)).toThrow("Map connection cells are unreachable: a")
})
it("rejects a blocked spawn even in a map without connections", () => {
  const a = room("a")
  a.rows = [".....", ".....", "..#..", ".....", "....."]
  expect(() => assertMapConnections({ a })).toThrow("Map connection cells are unreachable: a")
})
