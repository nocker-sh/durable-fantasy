import { expect, it } from "vitest"
import { getMapWorldPoint } from "#/world/maps/get-map-world-point"
import { getMapSpacePoint } from "#/world/maps/get-map-space-point"
import { createMapSpaceRegistry } from "#/world/maps/create-map-space-registry"
import { WORLD_SPACE_ROOT } from "#/world/maps/world-space-rules"
import { MAPS } from "#/world/maps"
import type { MapSpaceRegistry } from "#/world/maps/map-space-types"

const fixture = (): MapSpaceRegistry => ({
  [WORLD_SPACE_ROOT]: { id: WORLD_SPACE_ROOT },
  street: { id: "street", space: { parentMap: WORLD_SPACE_ROOT, frame: { origin: [100, 3, 200], width: 20, depth: 20, quarterTurns: 1 }, planarOrigin: [1000, 1000], metresPerPlanarUnit: 99 } },
  inside: { id: "inside", space: { parentMap: "street", frame: { origin: [2, 5, 4], width: 8, depth: 6, quarterTurns: 1 }, planarOrigin: [10, 20], metresPerPlanarUnit: 0.5 } },
  unknown: { id: "unknown" },
})

it("scales only the starting planar position, then composes both rotations and floor heights", () => {
  const maps = fixture(),
    before = structuredClone(maps)
  expect(getMapWorldPoint({ maps, mapId: "inside", point: [12, 24], heightMetres: 2 })).toEqual({ rootSpace: WORLD_SPACE_ROOT, point: [111, 10, 216] })
  expect(maps).toEqual(before)
})
it("returns unknown for unplaced maps and reference chains outside the world layout", () => {
  const maps = fixture()
  expect(getMapWorldPoint({ maps, mapId: "unknown", point: [12, 24], heightMetres: 2 })).toBeNull()
  expect(getMapWorldPoint({ maps: { ...maps, street: { id: "street" } }, mapId: "inside", point: [12, 24], heightMetres: 2 })).toBeNull()
  expect(getMapWorldPoint({ maps, mapId: WORLD_SPACE_ROOT, point: [0, 0], heightMetres: 0 })).toBeNull()
})
it.each(["missing", "constructor", "toString", "__proto__"])("rejects an unregistered starting map %s", (mapId) => {
  expect(() => getMapWorldPoint({ maps: fixture(), mapId, point: [0, 0], heightMetres: 0 })).toThrow("missing or miskeyed")
})
it("rejects a mismatched registry id and a cyclic reference instead of returning a position", () => {
  const maps = fixture(),
    inside = maps.inside.space
  if (!inside) throw new Error("Missing indoor fixture")
  expect(() => getMapWorldPoint({ maps: { ...maps, inside: { id: "other", space: inside } }, mapId: "inside", point: [12, 24], heightMetres: 2 })).toThrow("miskeyed")
  expect(() => getMapWorldPoint({ maps: { ...maps, street: { id: "street", space: { ...inside, parentMap: "inside" } } }, mapId: "inside", point: [12, 24], heightMetres: 2 })).toThrow("cycle")
})
it("rejects a missing or invalid ancestor instead of reporting unknown placement", () => {
  const maps = fixture(),
    street = maps.street.space
  if (!street) throw new Error("Missing street fixture")
  const missing = Object.fromEntries(Object.entries(maps).filter((entry) => entry[0] !== "street"))
  expect(() => getMapWorldPoint({ maps: missing, mapId: "inside", point: [12, 24], heightMetres: 2 })).toThrow("missing or miskeyed: street")
  expect(() =>
    getMapWorldPoint({ maps: { ...maps, street: { id: "street", space: { ...street, frame: { ...street.frame, quarterTurns: 4 } } } }, mapId: "inside", point: [12, 24], heightMetres: 2 }),
  ).toThrow("frame is invalid: street")
})
it("rejects invalid starting geometry even when its parent is outside the world layout", () => {
  const maps = fixture(),
    inside = maps.inside.space
  if (!inside) throw new Error("Missing indoor fixture")
  expect(() =>
    getMapWorldPoint({
      maps: { ...maps, street: { id: "street" }, inside: { id: "inside", space: { ...inside, frame: { ...inside.frame, quarterTurns: 4 } } } },
      mapId: "inside",
      point: [12, 24],
      heightMetres: 2,
    }),
  ).toThrow(RangeError)
})
it("projects every placed runtime map and preserves unknown indoor positions", () => {
  const maps = createMapSpaceRegistry(MAPS)
  for (const map of Object.values(MAPS)) {
    const space = maps[map.id].space,
      point = getMapWorldPoint({ maps, mapId: map.id, point: [12, 24], heightMetres: 2 })
    if (!space) expect(point).toBeNull()
    else {
      expect(point?.rootSpace).toBe(WORLD_SPACE_ROOT)
      expect(point?.point.every(Number.isFinite)).toBe(true)
      if (space.parentMap === WORLD_SPACE_ROOT) expect(point?.point).toEqual(getMapSpacePoint({ space, point: [12, 24], heightMetres: 2 }))
    }
  }
})
