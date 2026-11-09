import { expect, it, vi } from "vitest"
import { getMapCellWorldPoint } from "#/world/maps/get-map-cell-world-point"
import { getMapWorldPoint } from "#/world/maps/get-map-world-point"
import { createMapSpaceRegistry } from "#/world/maps/create-map-space-registry"
import { createMapWalkSampler } from "#/world/maps/ground/create-map-walk-sampler"
import { MAPS } from "#/world/maps"
import { TILE_M } from "#/world/town/fit"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { WR } from "#/world/maps/ground/rules"
import type { MapWalkSampler } from "#/world/maps/ground/types"

const maps = createMapSpaceRegistry(MAPS)
const walk: MapWalkSampler = { mapId: "phanthiet", displayFloorHeight: 0, sample: () => 2 }

it("projects the centre of an outdoor cell with sampled height converted to metres", () => {
  const point = getMapCellWorldPoint({ maps, mapId: "phanthiet", cell: [38, 80], walk })
  expect(point?.point[0]).toBeCloseTo(48 * TILE_M + 19.25 * TILE_M, 12)
  expect(point?.point[1]).toBe(2 * TILE_M)
  expect(point?.point[2]).toBeCloseTo(40.25 * TILE_M, 12)
})
it("removes an indoor display floor before adding height to the actual upper floor", () => {
  const mapId = "phanthiet-in-h-m5-floor-2",
    cell = MAPS[mapId].spawn,
    base = getMapWorldPoint({ maps, mapId, point: [(cell[0] + 0.5) / WR, (cell[1] + 0.5) / WR], heightMetres: 0 })
  if (!base) throw new Error("Missing placed upper floor")
  const floor: MapWalkSampler = { mapId, displayFloorHeight: 7, sample: () => 7 }
  expect(getMapCellWorldPoint({ maps, mapId, cell, walk: floor })).toEqual(base)
  const raised = getMapCellWorldPoint({ maps, mapId, cell, walk: { ...floor, sample: () => 10 } })
  expect(raised?.point[1]).toBeCloseTo(base.point[1] + 3 / ROOM_SCALE, 12)
})
it("uses the real surface sampler for an authored floor without duplicating its physical elevation", () => {
  const mapId = "phanthiet-in-h-m5",
    cell = MAPS[mapId].spawn,
    sampler = createMapWalkSampler(mapId)
  const base = getMapWorldPoint({ maps, mapId, point: [(cell[0] + 0.5) / WR, (cell[1] + 0.5) / WR], heightMetres: 0 })
  expect(getMapCellWorldPoint({ maps, mapId, cell, walk: sampler })).toEqual(base)
})
it("leaves unplaced interiors unknown without reading or inventing their height", () => {
  const map = Object.values(MAPS).find((map) => map.kind === "indoor" && !map.space)
  if (!map) throw new Error("Missing unplaced interior")
  const sample = vi.fn(() => {
    throw new Error("Must not sample an unknown world position")
  })
  expect(getMapCellWorldPoint({ maps, mapId: map.id, cell: map.spawn, walk: { mapId: map.id, displayFloorHeight: 0, sample } })).toBeNull()
  expect(sample).not.toHaveBeenCalled()
})
it.each(
  [
    [-1, 0],
    [96, 0],
    [0.5, 1],
    [NaN, 0],
    [Infinity, 0],
  ].map((cell) => ({ cell })),
)("rejects invalid walk coordinates %j", (input) => {
  expect(() => getMapCellWorldPoint({ maps, mapId: "phanthiet", cell: [input.cell[0], input.cell[1]], walk })).toThrow("Invalid world-position walk cell")
})
it("rejects blocked cells and a sampler from another map", () => {
  const map = MAPS.phanthiet,
    row = map.rows.findIndex((row) => row.includes("#"))
  if (row < 0) throw new Error("Missing obstacle fixture")
  expect(() => getMapCellWorldPoint({ maps, mapId: map.id, cell: [map.rows[row].indexOf("#"), row], walk })).toThrow("Invalid world-position walk cell")
  expect(() => getMapCellWorldPoint({ maps, mapId: map.id, cell: map.spawn, walk: { ...walk, mapId: "elsewhere" } })).toThrow("Invalid world-position walk cell")
})
it.each([NaN, Infinity])("rejects nonfinite sampled or reference heights %s", (height) => {
  expect(() => getMapCellWorldPoint({ maps, mapId: "phanthiet", cell: [38, 80], walk: { ...walk, sample: () => height } })).toThrow(RangeError)
  expect(() => getMapCellWorldPoint({ maps, mapId: "phanthiet", cell: [38, 80], walk: { ...walk, displayFloorHeight: height } })).toThrow(RangeError)
})
it("rejects finite heights whose metric offset overflows", () => {
  expect(() => getMapCellWorldPoint({ maps, mapId: "phanthiet", cell: [38, 80], walk: { ...walk, displayFloorHeight: -Number.MAX_VALUE, sample: () => Number.MAX_VALUE } })).toThrow(RangeError)
})
