import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { readSettingIndex } from "#/scripts/lib/read-setting-index"
import { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { stockLockSiteSchema } from "#/scripts/lib/stock-lock-site-schema"
import { getStockLockSiteGeometry } from "#/scripts/lib/get-stock-lock-site-geometry"
import { getStockLockSiteError } from "#/scripts/lib/get-stock-lock-site-error"
import { getStockLockSiteFootprint } from "#/scripts/lib/get-stock-lock-site-footprint"
import { getStockLockPasturePartition } from "#/scripts/lib/get-stock-lock-pasture-partition"
import { getStockLockRoadAttachmentError } from "#/scripts/lib/get-stock-lock-road-attachment-error"
import { getPlannedMapRoads } from "#/scripts/lib/get-planned-map-roads"
import { plannedBuildingFootprints } from "#/scripts/lib/planned-building-footprints"
import { MAPS } from "#/world/maps/index"
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import { HOUSES } from "#/world/town/houses"
import { TILE_M } from "#/world/town/fit"
import { getPastureFence } from "#/world/town/get-pasture-fence"

function fixture() {
  const entries = readSettingIndex(JSON.parse(readFileSync(".docs/settings/index.json", "utf8")))
  const documents = new Map(
    entries.map((entry) => {
      const document = readSetting(readFileSync(`.docs/settings/${entry.file}`, "utf8"))
      return [document.id, document]
    }),
  )
  const document = documents.get("facility-square-pasture"),
    map = documents.get("map-phanthiet")
  if (!document || !map) throw new Error("Missing pasture proposal")
  const plan = stockLockSchema.parse(document.stock_lock),
    site = stockLockSiteSchema.parse(document.stock_lock_site),
    geometry = getStockLockSiteGeometry({ plan, site, metresPerTile: TILE_M })
  const roads = getPlannedMapRoads({ map, roads: SQUARE_LAYOUT.roads, documents }),
    footprint = getStockLockSiteFootprint(document, TILE_M)
  if (geometry instanceof Error || roads instanceof Error || footprint instanceof Error || !footprint) throw new Error("Invalid source pasture proposal")
  const pasture = SQUARE_LAYOUT.pasture,
    pastureBounds: readonly [number, number, number, number] = [pasture.x0, pasture.z0, pasture.x1, pasture.z1]
  const obstacles: Array<Readonly<{ id: string; rect: readonly [number, number, number, number] }>> = plannedBuildingFootprints({
    houses: HOUSES,
    documents: documents,
    metresPerTile: TILE_M,
    includeRoofs: true,
  })
    .filter((house) => house.map === "phanthiet")
    .map((house) => ({ id: `building-${house.id}`, rect: [house.x0, house.z0, house.x1, house.z1] satisfies readonly [number, number, number, number] }))
  obstacles.push(
    ...[...SQUARE_LAYOUT.fields.map((rect, index) => ({ id: `field-${index + 1}`, rect })), { id: "pigpen", rect: SQUARE_LAYOUT.pigpen }, { id: "graveyard", rect: SQUARE_LAYOUT.graveyard }].map(
      (land) => ({
        id: land.id,
        rect: [land.rect.x0, land.rect.z0, land.rect.x1, land.rect.z1] satisfies readonly [number, number, number, number],
      }),
    ),
    { id: "pasture", rect: pastureBounds },
    footprint,
  )
  const ground = {
    mapTiles: MAPS.phanthiet.size / 2,
    obstacles,
    corridors: [...roads.map((road, index) => ({ id: `road-${index + 1}`, points: road.pts, halfWidth: road.w })), { id: "river", points: SQUARE_LAYOUT.river, halfWidth: SQUARE_LAYOUT.riverHW }],
  }

  return { document, plan, site, geometry, footprint, roads, props: { document, map: map.id, pasture: pastureBounds, metresPerTile: TILE_M, ground } }
}

it("fits the complete source proposal, including roof overhangs and the full terminal road width, without changing its inputs", () => {
  const source = fixture(),
    before = JSON.stringify([source.document, source.roads, source.props.ground, SQUARE_LAYOUT])
  expect(getStockLockSiteError(source.props)).toBeNull()
  expect((source.geometry.enclosure[2] - source.geometry.enclosure[0]) * TILE_M).toBeCloseTo(source.plan.layout.rows[0].length * source.plan.layout.cell_m)
  expect(source.footprint.rect).toEqual(source.geometry.enclosure)
  expect(source.footprint.id).toBe(`${source.document.id}/stock-lock`)
  expect(JSON.stringify([source.document, source.roads, source.props.ground, SQUARE_LAYOUT])).toBe(before)
})

it("does not squeeze the enclosure into the old west opening near the northern corner", () => {
  const source = fixture(),
    fence = getPastureFence(SQUARE_LAYOUT.pasture),
    inner = source.plan.gates.find((gate) => gate.id === "inner")
  if (!inner) throw new Error("Missing inner gate")
  const origin: [number, number] = [
    fence.gaps[0][0] - (source.plan.layout.rows[0].length * source.plan.layout.cell_m) / TILE_M,
    fence.gaps[0][1] - ((inner.door[1] + inner.width_cells / 2) * source.plan.layout.cell_m) / TILE_M,
  ]
  source.document.stock_lock_site = { ...source.site, origin_tiles: origin }
  expect(getStockLockSiteError(source.props)?.message).toContain("northwest pasture corner")
})

it("keeps an explicit grazing loss and one shared inner fence rather than overlapping two complete enclosures", () => {
  const source = fixture(),
    partition = getStockLockPasturePartition({ pasture: source.props.pasture, enclosure: source.geometry.enclosure, operationFloor: source.geometry.pasture })
  if (partition instanceof Error) throw partition
  const boundary = partition.stockBoundary,
    native = source.props.pasture,
    loss = partition.grazingLoss
  const area = Math.abs(boundary.slice(1).reduce((sum, point, index) => sum + boundary[index][0] * point[1] - point[0] * boundary[index][1], 0)) / 2
  expect(area).toBeCloseTo((native[2] - native[0]) * (native[3] - native[1]) - (loss[2] - loss[0]) * (loss[3] - loss[1]))
  expect(boundary[0]).toEqual(boundary[boundary.length - 1])
  expect(partition.outsideBoundary[0]).toEqual(boundary[0])
  expect(partition.outsideBoundary[partition.outsideBoundary.length - 1]).toEqual(boundary[4])
  expect(boundary[boundary.length - 2][0]).toBe(source.geometry.enclosure[2])
  expect(loss[2] - loss[0]).toBeGreaterThan(0)
})

it("requires the entire road terminal instead of just its centre to fit the outside reservation", () => {
  const source = fixture()
  source.plan.walking.outside_side.rect_m = [-1.4, 0, 1.4, 4.4]
  source.document.stock_lock = source.plan
  expect(getStockLockSiteError(source.props)?.message).toContain("full road terminal")
})

it("still rejects the terminal road if an earlier segment enters the enclosure", () => {
  const source = fixture(),
    corridor = source.props.ground.corridors.find((corridor) => corridor.id === "road-10")
  if (!corridor) throw new Error("Missing terminal road")
  const connection = source.geometry.connection
  corridor.points = [
    [43, 32],
    [connection[0], connection[1]],
  ]
  expect(getStockLockSiteError(source.props)?.message).toContain("covers road-10")
})

it("retains buildings, water, other roads and map bounds as obstacles to every reservation", () => {
  const source = fixture()
  source.props.ground.obstacles.push({ id: "neighbour-roof", rect: source.geometry.enclosure })
  expect(getStockLockSiteError(source.props)?.message).toContain("overlaps neighbour-roof")
  source.props.ground.obstacles.pop()
  source.props.ground.corridors.push({
    id: "other-road",
    points: [
      [43, 29],
      [43, 35],
    ],
    halfWidth: 0.1,
  })
  expect(getStockLockSiteError(source.props)?.message).toContain("covers other-road")
  source.props.ground.corridors.pop()
  source.props.ground.corridors.push({
    id: "new-water",
    points: [
      [43, 29],
      [43, 35],
    ],
    halfWidth: 0.1,
  })
  expect(getStockLockSiteError(source.props)?.message).toContain("covers new-water")
  source.props.ground.corridors.pop()
  source.props.ground.mapTiles = 46
  expect(getStockLockSiteError(source.props)?.message).toContain("leaves its map")
})

it("does not extend the inner operating floor past the real pasture or ignore a stale grazing reservation", () => {
  const source = fixture()
  source.plan.pasture_side.rect_m[2] += 1
  source.document.stock_lock = source.plan
  expect(getStockLockSiteError(source.props)?.message).toContain("leaves the retained pasture")
  source.document.stock_lock = fixture().plan
  expect(getStockLockSiteError({ ...source.props, pasture: [42.3, 30.4, 47, 40.5] })?.message).toContain("matching grazing reservation")
})

it("rejects a gap between the inner fence and its operating floor without inventing extra ground", () => {
  const source = fixture(),
    floor = source.geometry.pasture
  expect(getStockLockPasturePartition({ pasture: source.props.pasture, enclosure: source.geometry.enclosure, operationFloor: [floor[0] + 0.005, floor[1], floor[2] + 0.005, floor[3]] })).toEqual(
    new Error("Stock lock operating floor is detached or leaves the retained pasture"),
  )
  expect(getStockLockSiteGeometry({ plan: source.plan, site: source.site, metresPerTile: 0 })).toEqual(new Error("Invalid stock lock site scale or origin"))
})

it("binds the branch to the same map, projected endpoint and source index while keeping the design gate pending", () => {
  const source = fixture(),
    props = { facility: source.document, point: source.geometry.connection, map: source.props.map, roadIndex: source.site.road_connection.source_index }
  expect(getStockLockRoadAttachmentError(props)).toBeNull()
  expect(getStockLockRoadAttachmentError({ ...props, point: [42, 30.5] })).toBeInstanceOf(Error)
  expect(getStockLockRoadAttachmentError({ ...props, map: "map-elsewhere" })).toBeInstanceOf(Error)
  expect(getStockLockRoadAttachmentError({ ...props, roadIndex: 8 })).toBeInstanceOf(Error)
  source.document.design_gate = "通過"
  expect(getStockLockSiteError(source.props)?.message).toContain("Invalid proposed")
  expect(getStockLockRoadAttachmentError(props)).toBeInstanceOf(Error)
  expect(source.site.terrain_status).toBe("unreviewed")
  expect(source.site.stock_motion_status).toBe("unreviewed")
})
