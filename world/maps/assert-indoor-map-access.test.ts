import { expect, it } from "vitest"
import { assertIndoorMapAccess } from "#/world/maps/assert-indoor-map-access"
import type { MapDefinition } from "#/world/maps/types"

type AccessMap = Pick<MapDefinition, "id" | "size" | "rows" | "spawn" | "warps">
const fixture = (): AccessMap => ({ id: "room", size: 5, rows: Array.from({ length: 5 }, () => "....."), spawn: [2, 2], warps: [{ at: [0, 0], to: { map: "outside", at: [1, 1] } }] })
it("accepts reachable exits away from spawn", () => {
  expect(() => assertIndoorMapAccess(fixture())).not.toThrow()
})
it("rejects a map with no exit", () => {
  expect(() => assertIndoorMapAccess({ ...fixture(), warps: [] })).toThrow("has no exit")
})
it("rejects coincident warp triggers rather than choosing the first destination", () => {
  const map = fixture()
  map.warps = [...map.warps, { at: [0, 0], to: { map: "different", at: [2, 2] } }]
  expect(() => assertIndoorMapAccess(map)).toThrow("warp triggers overlap")
})
it("does not spawn a player on an immediate return trigger", () => {
  expect(() => assertIndoorMapAccess({ ...fixture(), spawn: [1, 1] })).toThrow("spawn touches a warp trigger")
})
