import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { readSettingIndex } from "#/scripts/lib/read-setting-index"
import { mapRoadPlanSchema } from "#/scripts/lib/map-road-plan-schema"
import { getPlannedMapRoads } from "#/scripts/lib/get-planned-map-roads"
import { auditBuildingSite } from "#/scripts/lib/audit-building-site"
import { auditRoofSite } from "#/scripts/lib/audit-roof-site"
import { plannedBuildingFootprints } from "#/scripts/lib/planned-building-footprints"
import { getCartApronSiteErrors } from "#/scripts/lib/get-cart-apron-site-errors"
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import { HOUSES } from "#/world/town/houses"
import { TILE_M } from "#/world/town/fit"

function fixture() {
  const entries = readSettingIndex(JSON.parse(readFileSync(".docs/settings/index.json", "utf8")))
  const documents = new Map(
    entries.map((entry) => {
      const document = readSetting(readFileSync(`.docs/settings/${entry.file}`, "utf8"))
      return [document.id, document]
    }),
  )
  const map = documents.get("map-phanthiet"),
    building = documents.get("building-barn"),
    room = documents.get("room-barn-2")
  if (!map || !building || !room) throw new Error("Missing farm proposal")

  return { map, building, room, documents, roads: SQUARE_LAYOUT.roads, plan: mapRoadPlanSchema.parse(map.road_plan) }
}

it("retains every road's width and material, leaves unchanged routes intact, and applies the whole plan without mutation", () => {
  const source = fixture(),
    before = JSON.stringify([source.roads, [...source.documents]]),
    roads = getPlannedMapRoads(source)
  if (roads instanceof Error) throw roads
  expect(roads).toHaveLength(source.roads.length)
  for (const index of roads.keys()) {
    expect(roads[index].w).toBe(source.roads[index].w)
    expect(roads[index].kind).toBe(source.roads[index].kind)
    if (!source.plan.changes.some((change) => change.source_index === index)) expect(roads[index].pts).toEqual(source.roads[index].pts)
  }
  expect(JSON.stringify([source.roads, [...source.documents]])).toBe(before)
  source.map.road_plan = { ...source.plan, changes: [...source.plan.changes].reverse() }
  expect(getPlannedMapRoads(source)).toEqual(roads)
})

it("does not permit a duplicate, unknown or stale source reference", () => {
  const source = fixture()
  source.map.road_plan = { ...source.plan, changes: [...source.plan.changes, source.plan.changes[0]] }
  expect(getPlannedMapRoads(source)).toEqual(new Error("Road plan has a duplicate or stale source"))
  for (const change of [
    { ...source.plan.changes[0], source_index: 999 },
    { ...source.plan.changes[0], source_start: [0, 0] },
  ]) {
    source.map.road_plan = { ...source.plan, changes: [change] }
    expect(getPlannedMapRoads(source)).toEqual(new Error("Road plan has a duplicate or stale source"))
  }
})

it("keeps the original external endpoints and rejects new branches that do not actually join their named road", () => {
  const source = fixture()
  source.map.road_plan = {
    ...source.plan,
    changes: [
      {
        ...source.plan.changes[0],
        points_tiles: [
          [35, 22],
          [50, 23],
        ],
      },
    ],
  }
  expect(getPlannedMapRoads(source)).toEqual(new Error("Road plan moves a preserved endpoint"))
  source.map.road_plan = {
    ...source.plan,
    changes: source.plan.changes.map((change) => {
      if (change.source_index !== 7) return change
      return { ...change, points_tiles: [[36, 15], ...change.points_tiles.slice(1)] }
    }),
  }
  expect(getPlannedMapRoads(source)).toEqual(new Error("Road plan endpoint has no matching junction"))
})

it("requires a branch to end at the same-map building's actual approach", () => {
  const source = fixture()
  source.building.map = "map-elsewhere"
  expect(getPlannedMapRoads(source)).toEqual(new Error("Road plan endpoint has no building approach"))
  source.building.map = source.map.id
  source.building.site_plan = undefined
  expect(getPlannedMapRoads(source)).toEqual(new Error("Road plan endpoint has no building approach"))
})

it("rejects zero-length segments, invalid coordinates and an attempted completed gate", () => {
  const source = fixture(),
    change = source.plan.changes[0]
  source.map.road_plan = { ...source.plan, changes: [{ ...change, points_tiles: [change.source_start, change.source_start, change.source_end] }] }
  expect(getPlannedMapRoads(source)).toEqual(new Error("Road plan has a zero-length segment"))
  source.map.road_plan = { ...source.plan, changes: [{ ...change, points_tiles: [[NaN, 22], change.source_end] }] }
  expect(getPlannedMapRoads(source)).toEqual(new Error("Invalid proposed map roads"))
  source.map.road_plan = source.plan
  source.map.design_gate = "通過"
  expect(getPlannedMapRoads(source)).toEqual(new Error("Invalid proposed map roads"))
})

it("fits the actual barn walls, roof and apron only with the explicitly rerouted roads, retaining all collision checks", () => {
  const source = fixture(),
    roads = getPlannedMapRoads(source),
    houses = plannedBuildingFootprints({ houses: HOUSES, documents: source.documents, metresPerTile: TILE_M })
  if (roads instanceof Error) throw roads
  expect(auditBuildingSite({ building: source.building, houses: houses, metresPerTile: TILE_M, roads: SQUARE_LAYOUT.roads }).problems.length).toBeGreaterThan(0)
  expect(auditBuildingSite({ building: source.building, houses: houses, metresPerTile: TILE_M, roads: roads }).problems).toEqual([])
  expect(
    auditRoofSite({
      building: source.building,
      houses: plannedBuildingFootprints({ houses: HOUSES, documents: source.documents, metresPerTile: TILE_M, includeRoofs: true }),
      metresPerTile: TILE_M,
      roads: roads,
      mapTiles: 48,
    }),
  ).toEqual([])
  expect(
    getCartApronSiteErrors({
      ...source,
      metresPerTile: TILE_M,
      ground: {
        mapTiles: 48,
        obstacles: houses.filter((house) => house.map === "phanthiet").map((house) => ({ id: house.id, rect: [house.x0, house.z0, house.x1, house.z1] })),
        corridors: roads.map((road, index) => ({ id: `road-${index}`, points: road.pts, halfWidth: road.w })),
      },
    }),
  ).toEqual([])
})
