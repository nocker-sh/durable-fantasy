import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { getRoomSiteRectangle } from "#/scripts/lib/get-room-site-rectangle"
import { getOutdoorReservationErrors } from "#/scripts/lib/get-outdoor-reservation-errors"
import { getCartApronSiteErrors } from "#/scripts/lib/get-cart-apron-site-errors"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditBuildingSite } from "#/scripts/lib/audit-building-site"
import { HOUSES } from "#/world/town/houses"
import { TILE_M } from "#/world/town/fit"

function fixture() {
  const building = readSetting(readFileSync(".docs/settings/buildings/building-barn.md", "utf8")),
    room = readSetting(readFileSync(".docs/settings/rooms/room-barn-2.md", "utf8"))
  const documents = new Map([building, room].map((document) => [document.id, document]))

  return { building, room, documents }
}

it("projects room origins, metre rectangles and every building quarter-turn with one outdoor scale", () => {
  const source = fixture()
  source.building.layout = { width: 10, depth: 8, cell_m: 0.5 }
  source.room.origin = [4, 2]
  const expected = [
    [11.5, 21.5, 12.5, 22],
    [11.5, 20, 12, 21],
    [10, 20, 11, 20.5],
    [10, 21.5, 10.5, 22.5],
  ]
  for (const quarter of [0, 1, 2, 3]) {
    source.building.site_plan = { origin: [10, 20], rotation_quarters: quarter }
    const before = JSON.stringify([...source.documents])
    expect(getRoomSiteRectangle({ building: source.building, room: source.room, rect: [1, 2, 2, 1], metresPerTile: 2 })).toEqual(expected[quarter])
    expect(JSON.stringify([...source.documents])).toBe(before)
  }
})

it("rejects invalid dimensions, unrelated rooms, upper floors and overflow instead of returning a false empty footprint", () => {
  const source = fixture()
  source.building.site_plan = { origin: [10, 20], rotation_quarters: 0 }
  for (const metresPerTile of [0, -1, NaN, Infinity, Number.MIN_VALUE]) expect(getRoomSiteRectangle({ ...source, rect: [0, 0, 2, 4], metresPerTile })).toBeInstanceOf(Error)
  source.room.building = "building-other"
  expect(getRoomSiteRectangle({ ...source, rect: [0, 0, 2, 4], metresPerTile: 1.4 })).toBeInstanceOf(Error)
  source.room.building = source.building.id
  source.room.floor = 1
  expect(getRoomSiteRectangle({ ...source, rect: [0, 0, 2, 4], metresPerTile: 1.4 })).toBeInstanceOf(Error)
})

it("checks waiting space against whole obstacle rectangles, map bounds and the widths of roads and water", () => {
  const ground = {
    bounds: [2, 2, 4, 4] satisfies readonly [number, number, number, number],
    mapTiles: 48,
    obstacles: [{ id: "field", rect: [3, 3, 5, 5] satisfies readonly [number, number, number, number] }],
    corridors: [
      {
        id: "road",
        points: [
          [0, 1.8],
          [8, 1.8],
        ] satisfies ReadonlyArray<readonly [number, number]>,
        halfWidth: 0.3,
      },
    ],
  }
  expect(getOutdoorReservationErrors(ground)).toEqual(["Outdoor reservation overlaps field", "Outdoor reservation covers road"])
  expect(getOutdoorReservationErrors({ ...ground, obstacles: [], corridors: [] })).toEqual([])
  expect(getOutdoorReservationErrors({ ...ground, mapTiles: 3 })).toContain("Outdoor reservation leaves its map")
  expect(getOutdoorReservationErrors({ ...ground, corridors: [{ ...ground.corridors[0], id: "river" }] })).toContain("Outdoor reservation covers river")
})

it("rejects malformed ground input instead of treating it as an absence of obstacles", () => {
  expect(
    getOutdoorReservationErrors({
      bounds: [0, 0, 1, 1],
      mapTiles: 48,
      obstacles: [{ id: "bad", rect: [2, 2, 1, 1] }],
      corridors: [
        {
          id: "bad",
          points: [
            [0, 0],
            [1, 1],
          ],
          halfWidth: NaN,
        },
      ],
    }),
  ).toEqual(["Invalid reservation obstacle bad", "Invalid reservation corridor bad"])
})

it("keeps an unassigned site distinct from a checked proposal, and checks the apron even if the building fits", () => {
  const source = fixture(),
    ground = { mapTiles: 100, obstacles: [], corridors: [] }
  source.building.site_plan = undefined
  expect(getCartApronSiteErrors({ ...source, metresPerTile: TILE_M, ground })).toEqual([])
  source.building.site_plan = { origin: [10, 20], rotation_quarters: 0, status: "proposed" }
  const bounds = getRoomSiteRectangle({ ...source, rect: [0.5, 9, 2, 4], metresPerTile: TILE_M })
  if (bounds instanceof Error) throw bounds
  expect(auditBuildingSite({ building: source.building, houses: [], metresPerTile: TILE_M, roads: [], mapTiles: 100 }).problems).toEqual([])
  expect(getCartApronSiteErrors({ ...source, metresPerTile: TILE_M, ground: { ...ground, obstacles: [{ id: "reserved-crop", rect: bounds }] } })).toEqual([
    "Outdoor reservation overlaps reserved-crop",
  ])
})

it("does not fit the proposed barn at the current runtime origin by silently cropping it to the old walls", () => {
  const source = fixture(),
    native = HOUSES.find((house) => house.id === "barn")
  if (!native) throw new Error("Missing native barn")
  source.building.site_plan = { origin: [native.x0, native.z0], rotation_quarters: 0, status: "proposed" }
  expect(auditBuildingSite({ building: source.building, houses: HOUSES, metresPerTile: TILE_M, roads: [], mapTiles: 48 }).problems).toContain("Outdoor footprint leaves its map")
  const apron = getRoomSiteRectangle({ ...source, rect: [0.5, 9, 2, 4], metresPerTile: TILE_M })
  if (apron instanceof Error) throw apron
  expect(apron[2] - apron[0]).toBeCloseTo(2 / TILE_M)
  expect(apron[3] - apron[1]).toBeCloseTo(4 / TILE_M)
})
