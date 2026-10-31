import { auditRoomWorkUses } from "#/scripts/lib/audit-room-work-uses"
import { hasEntryApproachSections } from "#/scripts/lib/has-entry-approach-sections"
import { auditEntryApproachSections } from "#/scripts/lib/audit-entry-approach-sections"
import { getWindmillApproachSection } from "#/scripts/lib/get-windmill-approach-section"
import { getWindmillSiteTerrain } from "#/scripts/lib/get-windmill-site-terrain"
import type { Rectangle } from "#/lib/engine/rectangle-subtraction"
import { getWindmillYardSiteReviews } from "#/scripts/lib/get-windmill-yard-site-reviews"
import { getWindmillSiteReservations } from "#/scripts/lib/get-windmill-site-reservations"
import { getWindmillYardSiteErrors } from "#/scripts/lib/get-windmill-yard-site-errors"
import { auditWindmillYard } from "#/scripts/lib/audit-windmill-yard"
import { auditTownSupplySystems } from "#/scripts/lib/audit-town-supply-systems"
import { getKitchenWaterCycleError } from "#/scripts/lib/get-kitchen-water-cycle-error"
import { getDishwaterCaptureError } from "#/scripts/lib/get-dishwater-capture-error"
import { getParkedCartDepartureError } from "#/scripts/lib/get-parked-cart-departure-error"
import { getCartApronSiteErrors } from "#/scripts/lib/get-cart-apron-site-errors"
import { getPlannedMapRoads } from "#/scripts/lib/get-planned-map-roads"
import { getStockLockReviewError } from "#/scripts/lib/get-stock-lock-review-error"
import { getStockLockSiteError } from "#/scripts/lib/get-stock-lock-site-error"
import { getStockLockSiteFootprint } from "#/scripts/lib/get-stock-lock-site-footprint"
import { auditOpenDoorPassages } from "#/scripts/lib/audit-open-door-passages"
import { auditTownDistrictPlan } from "#/scripts/lib/audit-town-district-plan"
import { auditHotWaterService } from "#/scripts/lib/audit-hot-water-service"
import { auditPersonalStoragePacking } from "#/scripts/lib/audit-personal-storage-packing"
import { auditSleepingMaterials } from "#/scripts/lib/audit-sleeping-materials"
import { auditCookingHearth } from "#/scripts/lib/audit-cooking-hearth"
import { getWaterPickupReviewError } from "#/scripts/lib/get-water-pickup-review-error"
import { getWaterVesselGripReviewError } from "#/scripts/lib/get-water-vessel-grip-review-error"
import { getWaterCollectionLandingError } from "#/scripts/lib/get-water-collection-landing-error"
import { auditPotableWaterSupply } from "#/scripts/lib/audit-potable-water-supply"
import { auditResidentAppearanceSources } from "#/scripts/lib/audit-resident-appearance-sources"
import { auditPlaceSettings } from "#/scripts/lib/audit-place-settings"
import { auditSeatedMeal } from "#/scripts/lib/audit-seated-meal"
import { auditDishDrying } from "#/scripts/lib/audit-dish-drying"
import { auditEcologyZones } from "#/scripts/lib/audit-ecology-zones"
import { getMonsterAppearanceError } from "#/scripts/lib/get-monster-appearance-error"
import { auditAshReceivers } from "#/scripts/lib/ash-receiver"
import { auditNativeWorkPose } from "#/scripts/lib/native-work-pose"
import { auditHearthHandoff } from "#/scripts/lib/hearth-handoff"
import { auditHearthCarry } from "#/scripts/lib/hearth-carry"
import { auditStorageRetrievals } from "#/scripts/lib/audit-storage-retrievals"
import { compileRoomFixtures } from "#/scripts/lib/room-fixtures"
import { compileFlues } from "#/scripts/lib/flue-sections"
import { auditDoorPushes } from "#/scripts/lib/audit-door-pushes"
import { auditBuildingFoundation } from "#/scripts/lib/audit-building-foundation"
import { auditEntrySteps } from "#/scripts/lib/audit-entry-steps"
import { entryStepGeometry } from "#/scripts/lib/entry-step-geometry"
import type { EntrySteps } from "#/scripts/lib/entry-steps-types"
import { ScalarField } from "#/lib/engine/scalar-field"
import { FR, GRID_N } from "#/world/maps/ground/rules"
import { createGroundFields } from "#/world/maps/ground/create-ground-fields"
import { CRAFT_YARD, craftYardFootprints } from "#/world/town/craft-yard"
import { auditRuntimeStations } from "#/scripts/lib/runtime-stations"
import { STATIONS } from "#/world/town/stations"
import { auditClassrooms } from "#/scripts/lib/classrooms"
import { auditRuntimeGraphics } from "#/scripts/lib/audit-runtime-graphics"
import { auditRuntimeLayout } from "#/scripts/lib/audit-runtime-layout"
import { interiorPlan } from "#/world/town/interior-plan"
import { floorPlan } from "#/world/town/floorplan/floor-plan"
import { auditFurnitureMaintenance } from "#/scripts/lib/furniture-maintenance"
import { auditHotWork } from "#/scripts/lib/hot-work"
import { auditAnimalCare } from "#/scripts/lib/animal-care"
import { townAnimalSpawns } from "#/world/town/animals"
import { auditGroundStorage } from "#/scripts/lib/ground-storage"
import { auditLaundryDrying } from "#/scripts/lib/laundry-drying"
import { auditResidentJourneys, type JourneyMap } from "#/scripts/lib/resident-journeys"
import { plannedBuildingFootprints } from "#/scripts/lib/planned-building-footprints"
import { auditGuestSleepingPlaces } from "#/scripts/lib/guest-sleeping-places"
import { CHAPEL, chapelFootprints } from "#/world/town/chapel"
import { auditParallelAccess } from "#/scripts/lib/parallel-access"
import { plannedGardens } from "#/scripts/lib/planned-gardens"
import { auditReservedLand } from "#/scripts/lib/audit-reserved-land"
import type { ReservedLand } from "#/scripts/lib/land-use"
import { auditOutdoorAccess } from "#/scripts/lib/audit-outdoor-access"
import { auditTransportLoads } from "#/scripts/lib/transport-load"
import { auditTransportContainers } from "#/scripts/lib/transport-containers"
import { auditSanitation } from "#/scripts/lib/sanitation"
import { auditFacilityFootprint } from "#/scripts/lib/audit-facility-footprint"
import { auditHouseholdMeals } from "#/scripts/lib/household-meals"
import { auditCargoRoutes } from "#/scripts/lib/cargo-routes"
import { auditFurnitureUse } from "#/scripts/lib/furniture-use"
import { auditRoomClearance } from "#/scripts/lib/room-clearance"
import { auditBuildingWater } from "#/scripts/lib/building-water"
import { auditStairSections } from "#/scripts/lib/audit-stair-sections"
import { auditRoofSection } from "#/scripts/lib/audit-roof-section"
import { auditRoofSite } from "#/scripts/lib/audit-roof-site"
import { roofBounds } from "#/scripts/lib/roof-bounds"
import { auditDoorSwings } from "#/scripts/lib/audit-door-swings"
import { auditPersonalStorage } from "#/scripts/lib/personal-storage"
import { auditSiteApproaches } from "#/scripts/lib/audit-site-approaches"
import { auditBuildingSite } from "#/scripts/lib/audit-building-site"
import { auditSiteBounds } from "#/scripts/lib/audit-site-bounds"
import { TILE_M } from "#/world/town/fit"
import { SQUARE_LAYOUT } from "#/world/maps/layout"
import { MARKET } from "#/world/maps/layouts/market"
import { CRAFT } from "#/world/maps/layouts/craft"
import { GATE } from "#/world/maps/layouts/gate"
import { auditDesignDependencies } from "#/scripts/lib/design-dependencies"
import { readSettingIndex } from "#/scripts/lib/read-setting-index"
import { auditSettingInventory } from "#/scripts/lib/audit-setting-inventory"
import { SETTING_PREFIXES } from "#/scripts/lib/setting-index"
import { auditMonsterEcology } from "#/scripts/lib/audit-monster-ecology"
import { ITEMS } from "#/world/core/items/catalog"
import { auditSleepingPlaces } from "#/scripts/lib/sleeping-places"
import { auditFacilitySite } from "#/scripts/lib/facility-site"
import { auditBuildingEnvelope } from "#/scripts/lib/audit-building-envelope"
import { auditBuildingLayout } from "#/scripts/lib/audit-building-layout"
import { readFile, readdir } from "node:fs/promises"
import { parseArgs } from "node:util"
import { auditResidentRoutineSources } from "#/scripts/lib/resident-routine-source"
import { ROUTINES } from "#/world/town/routines"
import { auditPrivateRoomAccess } from "#/scripts/lib/private-room-access"
import { auditSettingReferenceTypes } from "#/scripts/lib/setting-reference-types"
import { auditTextileOrders } from "#/scripts/lib/audit-textile-orders"
import { auditWorkerAssignments } from "#/scripts/lib/worker-assignments"
import { resolve } from "node:path"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditRoomGrid } from "#/scripts/lib/audit-room-grid"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { HOUSES } from "#/world/town/houses"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { MAPS } from "#/world/maps/index"
import { MONSTER_KINDS, SPAWNS } from "#/world/core/monsters"

function settingsOptions() {
  try {
    return parseArgs({
      args: process.argv.slice(2),
      options: { "require-designed": { type: "boolean", default: false }, "terrain-report": { type: "boolean", default: false } },
      strict: true,
      allowPositionals: false,
    }).values
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Invalid settings options")
    process.exit(1)
  }
}
const options = settingsOptions()
const base = resolve(import.meta.dirname, "../.docs/settings")
const entries = readSettingIndex(JSON.parse(await readFile(resolve(base, "index.json"), "utf8")))
async function documentFiles(directory: string, prefix = ""): Promise<string[]> {
  const files: string[] = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = `${prefix}${entry.name}`
    if (entry.isDirectory()) files.push(...(await documentFiles(resolve(directory, entry.name), `${relative}/`)))
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(relative)
    else if (entry.isSymbolicLink()) throw Error(`Unsupported linked setting: ${relative}`)
  }
  return files
}
const documents = new Map<string, SettingDocument>(),
  failures = auditSettingInventory(entries, await documentFiles(base))
for (const entry of entries) {
  try {
    if (documents.has(entry.id)) throw Error("Duplicate document ID")
    const path = resolve(base, entry.file)
    if (!path.startsWith(`${base}/`)) throw Error("Document path outside settings")
    const doc = readSetting(await readFile(path, "utf8"))
    if (doc.id !== entry.id || doc.kind !== entry.kind || entry.file !== `${entry.kind}/${entry.id}.md`) throw Error("Index and document identity disagree")
    documents.set(doc.id, doc)
    for (const problem of [...auditRoomGrid(doc), ...auditFurnitureUse(doc), ...auditParallelAccess(doc), ...auditRoomClearance(doc), ...auditDoorSwings(doc), ...auditCargoRoutes(doc)])
      failures.push(`${doc.id}: ${problem}`)
  } catch (error) {
    failures.push(`${entry.id}: ${error instanceof Error ? error.message : "Invalid document"}`)
  }
}
const required = [
  `building-${CHAPEL.id}`,
  "town-phanthiet",
  "town-quynhon",
  "town-hue",
  ...HOUSES.flatMap((h) => [`building-${h.id}`, ...h.plan.rooms.map((_r, i) => `room-${h.id}-${i + 1}`)]),
  ...RESIDENTS.map((r) => `resident-${r.name}`),
  ...Object.keys(MAPS).map((id) => `map-${id}`),
  ...Object.keys(MONSTER_KINDS).map((id) => `monster-${id}`),
]
for (const id of required) if (!documents.has(id)) failures.push(`Missing document: ${id}`)
for (const house of HOUSES) {
  const doc = documents.get(`building-${house.id}`)
  if (!doc) continue
  const pieces = Array.from({ length: floorPlan(house.id).floors }, (_, floor) => interiorPlan(house, floor).unrenderedFurniture.map((piece) => ({ floor, name: piece.name }))).flat()
  for (const problem of auditRuntimeGraphics(doc, { source: "world/town/interiors.ts", pieces })) failures.push(`${doc.id}: ${problem}`)
  for (const problem of auditRuntimeLayout(doc, { source: "world/town/floorplan/floor-plan.ts", rooms: floorPlan(house.id).unrepresentedRooms })) failures.push(`${doc.id}: ${problem}`)
}
const settingIdPrefixes = Object.values(SETTING_PREFIXES).map((prefix) => `${prefix}-`)
function references(value: unknown): string[] {
  if (typeof value === "string") return settingIdPrefixes.some((prefix) => value.startsWith(prefix)) ? [value] : []
  if (Array.isArray(value)) return value.flatMap(references)
  if (value && typeof value === "object")
    return Object.entries(value)
      .filter((entry2) => {
        const key = entry2[0]
        return !["source", "title", "issues", "file"].includes(key)
      })
      .flatMap((entry3) => {
        const value = entry3[1]
        return references(value)
      })
  return []
}
for (const doc of documents.values()) for (const reference of references(doc)) if (!documents.has(reference)) failures.push(`${doc.id}: unresolved reference ${reference}`)
for (const doc of documents.values()) {
  failures.push(...auditTownDistrictPlan({ town: doc, documents }))
  failures.push(...auditTownSupplySystems({ town: doc, documents }))
}
for (const doc of documents.values())
  if (doc.kind === "facilities") {
    for (const problem of auditFacilitySite(doc, MAPS)) failures.push(`${doc.id}: ${problem}`)
    for (const problem of auditWindmillYard(doc)) failures.push(`${doc.id}: ${problem}`)
  }
const chapel = documents.get(`building-${CHAPEL.id}`)
if (chapel)
  for (const problem of auditBuildingEnvelope(chapel, { width_m: (CHAPEL.body.x1 - CHAPEL.body.x0) * TILE_M, depth_m: (CHAPEL.body.z1 - CHAPEL.body.z0) * TILE_M, scope: "main-body" }))
    failures.push(`${chapel.id}: ${problem}`)
for (const doc of documents.values())
  if (doc.kind === "buildings") {
    try {
      compileRoomFixtures(doc, [...documents.values()])
    } catch (error) {
      failures.push(`${doc.id}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
for (const room of documents.values())
  if (room.kind === "rooms")
    for (const error of [
      ...auditPersonalStoragePacking(room, documents),
      ...auditSleepingMaterials(room, documents),
      ...auditHotWaterService(room, documents),
      ...auditCookingHearth(room, documents),
      ...auditAshReceivers(room, documents.get(String(room.building)), documents),
      ...auditHearthCarry(room, documents.get(String(room.building))),
      ...auditHearthHandoff(room, documents.get(String(room.building)), documents),
      ...auditNativeWorkPose(room, documents.get(String(room.building)), documents),
    ])
      failures.push(`${room.id}: ${error}`)
for (const doc of documents.values())
  if (doc.flues) {
    try {
      compileFlues(doc, documents)
    } catch (error) {
      failures.push(`${doc.id}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
for (const doc of documents.values())
  if (doc.kind === "buildings")
    for (const problem of [...auditBuildingLayout(doc, documents), ...auditStairSections(doc, documents), ...auditRoofSection(doc, documents), ...auditPrivateRoomAccess(doc, documents)])
      failures.push(`${doc.id}: ${problem}`)
const outdoorLayouts = { phanthiet: SQUARE_LAYOUT, "phanthiet-market": MARKET, "phanthiet-craft": CRAFT, "phanthiet-gate": GATE }
const outdoorLayoutKeys: ReadonlyArray<keyof typeof outdoorLayouts> = ["phanthiet", "phanthiet-market", "phanthiet-craft", "phanthiet-gate"]
for (const key of outdoorLayoutKeys) {
  const map = documents.get(`map-${key}`),
    layout = outdoorLayouts[key]
  if (!map) continue
  const roads = getPlannedMapRoads({ map, roads: layout.roads, documents })
  if (roads instanceof Error) failures.push(`${map.id}: ${roads.message}`)
  else outdoorLayouts[key] = { ...layout, roads }
}
const reservedLand = new Map<string, ReservedLand[]>()
for (const entry4 of Object.entries(outdoorLayouts)) {
  const id = entry4[0]
  const layout = entry4[1]

  const map = `map-${id}`,
    gardens = plannedGardens(documents, map, layout.gardens)
  failures.push(...gardens.errors)
  const rect = (r: { x0: number; z0: number; x1: number; z1: number }) => [r.x0, r.z0, r.x1, r.z1] as const
  reservedLand.set(map, [
    ...(id === CHAPEL.map ? chapelFootprints() : []),
    ...(id === CRAFT_YARD.map ? craftYardFootprints() : []),
    ...gardens.areas,
    ...layout.fields.map((r, i) => ({ id: `field-${i + 1}`, rect: rect(r) })),
    ...["pasture", "pigpen", "graveyard"].map((key) => ({ id: key, rect: rect(layout[key as "pasture" | "pigpen" | "graveyard"]) })),
  ])
}
const terrainFields = new Map<string, ScalarField>()
function terrainFor(map: string) {
  const id = map.replace(/^map-/, ""),
    layout = Object.entries(outdoorLayouts).find((entry) => entry[0] === id)?.[1]
  if (!layout) return undefined
  const known = terrainFields.get(id)
  if (known) return known
  const terrain = new ScalarField(createGroundFields(layout).h, GRID_N, FR)
  terrainFields.set(id, terrain)
  return terrain
}
const entryFootprints = [...documents.values()]
  .filter((doc) => doc.kind === "buildings")
  .flatMap((doc) =>
    ((doc.entry_steps ?? []) as EntrySteps[]).flatMap((steps, i) => {
      const geometry = entryStepGeometry({ building: doc, documents: documents, steps: steps, metres: TILE_M })
      return geometry ? [{ id: `${doc.id}/entry-${i + 1}`, map: String(doc.map), rect: geometry.bounds }] : []
    }),
  )
for (const footprint of entryFootprints) reservedLand.get(footprint.map)?.push(footprint)
for (const doc of documents.values())
  if (doc.foundation || doc.entry_steps || hasEntryApproachSections(doc)) {
    const terrain = terrainFor(String(doc.map))
    if (!terrain) failures.push(`${doc.id}: foundation terrain is unavailable`)
    else
      for (const problem of [
        ...auditBuildingFoundation(doc, terrain, TILE_M),
        ...auditEntrySteps({ building: doc, documents: documents, terrain: terrain, metres: TILE_M }),
        ...auditEntryApproachSections({ building: doc, documents, terrain, metres: TILE_M, roads: Object.entries(outdoorLayouts).find((entry) => `map-${entry[0]}` === doc.map)?.[1].roads ?? [] }),
      ])
        failures.push(`${doc.id}: ${problem}`)
  }
const proposedHouses = plannedBuildingFootprints({ houses: HOUSES, documents: documents, metresPerTile: TILE_M })
const facilityObstacles = [
  ...craftYardFootprints(),
  ...entryFootprints,
  ...[...documents.values()].flatMap((doc) => {
    const site = doc.kind === "facilities" ? (doc.site as { map: string; occupied_rect_tiles?: number[] }) : null
    const rect = site?.occupied_rect_tiles
    return site && Array.isArray(rect) && rect.length === 4 && rect.every(Number.isFinite) ? [{ id: doc.id, map: site.map, rect: rect as [number, number, number, number] }] : []
  }),
]
for (const document of documents.values()) {
  const footprint = getStockLockSiteFootprint(document, TILE_M)
  if (footprint instanceof Error) failures.push(`${document.id}: ${footprint.message}`)
  else if (footprint) facilityObstacles.push(footprint)
}
const windmillSites = getWindmillYardSiteReviews({
  roadsByMap: new Map(Object.entries(outdoorLayouts).map((entry) => [`map-${entry[0]}`, entry[1].roads])),
  documents: documents.values(),
  fieldsByMap: new Map(Object.entries(outdoorLayouts).map((entry) => [`map-${entry[0]}`, entry[1].fields] satisfies [string, readonly Rectangle[]])),
  metresPerTile: TILE_M,
})
failures.push(...windmillSites.errors)
const windmillLand = getWindmillSiteReservations({ reviews: windmillSites.reviews, reservations: reservedLand })
failures.push(...windmillLand.errors)
facilityObstacles.push(...windmillLand.footprints)
for (const entry of windmillLand.reservations) reservedLand.set(entry[0], [...entry[1]])
for (const footprint of entryFootprints)
  for (const problem of auditReservedLand({
    id: footprint.id,
    bounds: footprint.rect,
    paths: [],
    areas: [...(reservedLand.get(footprint.map) ?? []), ...facilityObstacles.filter((other) => other.map === footprint.map)],
    metres: TILE_M,
  }))
    failures.push(`${footprint.id}: ${problem}`)
const outdoorObstacles = [...proposedHouses.map((h) => ({ id: `building-${h.id}`, map: `map-${h.map}`, rect: [h.x0, h.z0, h.x1, h.z1] as const })), ...facilityObstacles]
const proposedRoofs = plannedBuildingFootprints({ houses: HOUSES, documents: documents, metresPerTile: TILE_M, includeRoofs: true })
for (const review of windmillSites.reviews) {
  const map = review.footprint.map
  const layout = Object.entries(outdoorLayouts).find((entry) => `map-${entry[0]}` === map)?.[1]
  if (!layout) {
    failures.push(`${review.footprint.id}: Windmill site has no outdoor map`)
    continue
  }
  const errors = getWindmillYardSiteErrors({
    review,
    ground: {
      mapTiles: MAPS[map.replace(/^map-/, "")]?.size / 2,
      obstacles: [
        ...proposedRoofs
          .filter((house) => `map-${house.map}` === map)
          .map((house) => ({ id: `building-${house.id}`, rect: [house.x0, house.z0, house.x1, house.z1] satisfies readonly [number, number, number, number] })),
        ...facilityObstacles.filter((obstacle) => obstacle.map === map),
        ...(reservedLand.get(map) ?? []),
      ],
      corridors: [...layout.roads.map((road, index) => ({ id: `road-${index + 1}`, points: road.pts, halfWidth: road.w })), { id: "river", points: layout.river, halfWidth: layout.riverHW }],
    },
  })
  for (const error of errors) failures.push(`${review.footprint.id}: ${error}`)
  const terrain = terrainFor(map)
  if (!terrain) failures.push(`${review.footprint.id}: Windmill site has no terrain field`)
  else {
    const section = getWindmillApproachSection({ review, terrain, metresPerTile: TILE_M })
    if (section instanceof Error) failures.push(`${review.footprint.id}: ${section.message}`)
    if (options["terrain-report"])
      console.log(JSON.stringify({ map, scope: "planned_layout_bilinear_terrain_only", regions: getWindmillSiteTerrain({ review, terrain, metresPerTile: TILE_M }), section }))
  }
}
const journeyMaps = new Map<string, JourneyMap>(
  Object.entries(outdoorLayouts).map((entry5) => {
    const id = entry5[0]
    const layout = entry5[1]

    const map = `map-${id}`
    return [
      map,
      {
        ground: {
          map_tiles: MAPS[id].size / 2,
          metres_per_tile: TILE_M,
          water: { points: layout.river, half_width: layout.riverHW },
          bridges: [[layout.bridge.x0, layout.bridge.z0, layout.bridge.x1, layout.bridge.z1]],
          obstacles: [
            ...outdoorObstacles
              .filter((o) => o.map === map)
              .map((inputProps) => {
                const id = inputProps.id
                const rect = inputProps.rect
                return { id, rect }
              }),
            ...(reservedLand.get(map) ?? []),
          ],
        },
        arrivals: new Map(
          id === "phanthiet"
            ? [
                [
                  "washing-upper-landing",
                  {
                    facility: "facility-square-washing",
                    place: "lavoir1",
                    point: [(layout.lavStairs.x0 + layout.lavStairs.x1) / 2, layout.lavStairs.z1] as const,
                    width_m: (layout.lavStairs.x1 - layout.lavStairs.x0) * TILE_M,
                  },
                ],
              ]
            : [],
        ),
      },
    ]
  }),
)
for (const actor of documents.values()) failures.push(...auditResidentJourneys(actor, documents, journeyMaps))
for (const doc of documents.values())
  if (doc.kind === "facilities") {
    const site = doc.site as { map: string; occupied_rect_tiles?: number[] } | undefined,
      layout = site ? outdoorLayouts[site.map.replace(/^map-/, "") as keyof typeof outdoorLayouts] : undefined
    if (site?.occupied_rect_tiles && !layout) failures.push(`${doc.id}: facility ground layout is not available`)
    if (layout && site)
      for (const problem of auditFacilityFootprint({
        doc: doc,
        houses: proposedHouses,
        roads: layout.roads,
        mapTiles: MAPS[site.map.replace(/^map-/, "")]?.size / 2,
        metresPerTile: TILE_M,
        water: { points: layout.river, half_width: layout.riverHW },
        facilities: facilityObstacles,
      }))
        failures.push(`${doc.id}: ${problem}`)
    if (layout && site)
      for (const problem of auditOutdoorAccess({
        doc: doc,
        documents: documents,
        obstacles: outdoorObstacles,
        metres: TILE_M,
        mapTiles: MAPS[site.map.replace(/^map-/, "")]?.size / 2,
        water: { points: layout.river, half_width: layout.riverHW },
      }))
        failures.push(`${doc.id}: ${problem}`)
  }
for (const doc of documents.values())
  if (doc.kind === "buildings" && (doc.site_plan || doc.design_gate === "通過")) {
    const layout = outdoorLayouts[String(doc.map).replace(/^map-/, "") as keyof typeof outdoorLayouts]
    if (!layout) failures.push(`${doc.id}: missing outdoor ground layout`)
    else {
      for (const problem of auditBuildingSite({ building: doc, houses: proposedHouses, metresPerTile: TILE_M, roads: layout.roads, mapTiles: MAPS[String(doc.map).replace(/^map-/, "")]?.size / 2 })
        .problems)
        failures.push(`${doc.id}: ${problem}`)
      for (const steps of (doc.entry_steps ?? []) as EntrySteps[]) {
        const geometry = entryStepGeometry({ building: doc, documents: documents, steps: steps, metres: TILE_M })
        if (geometry)
          for (const problem of auditSiteBounds({
            bounds: geometry.bounds,
            building: doc,
            houses: proposedHouses,
            roads: layout.roads,
            mapTiles: MAPS[String(doc.map).replace(/^map-/, "")]?.size / 2,
            label: "Entry stair footprint",
          }))
            failures.push(`${doc.id}: ${problem}`)
      }
      for (const problem of auditSiteApproaches({
        building: doc,
        documents: documents,
        houses: proposedHouses,
        metresPerTile: TILE_M,
        roads: layout.roads,
        obstacles: facilityObstacles.filter((obstacle) => !entryFootprints.some((part) => part.id === obstacle.id && part.id.startsWith(`${doc.id}/`))),
        ground: { map_tiles: MAPS[String(doc.map).replace(/^map-/, "")]?.size / 2, watercourses: [{ name: "river", points: layout.river, half_width: layout.riverHW }] },
      }))
        failures.push(`${doc.id}: ${problem}`)
      for (const problem of auditBuildingWater(doc, TILE_M, [{ name: "river", points: layout.river, half_width: layout.riverHW }])) failures.push(`${doc.id}: ${problem}`)
      for (const problem of auditRoofSite({ building: doc, houses: proposedRoofs, metresPerTile: TILE_M, roads: layout.roads, mapTiles: MAPS[String(doc.map).replace(/^map-/, "")]?.size / 2 }))
        failures.push(`${doc.id}: ${problem}`)
    }
  }
for (const doc of documents.values()) {
  const map = String(doc.map ?? (doc.site as { map?: string } | undefined)?.map),
    areas = reservedLand.get(map)
  if (!areas) continue
  const site = doc.site_plan as { approaches?: { points_tiles: number[][]; width_m: number }[] } | undefined
  const bounds = site
    ? (roofBounds(doc, TILE_M) ?? auditBuildingSite({ building: doc, houses: [], metresPerTile: TILE_M, roads: [] }).bounds)
    : (doc.site as { occupied_rect_tiles?: number[] } | undefined)?.occupied_rect_tiles
  const paths = site?.approaches ?? ((doc.access_routes ?? []) as { points_tiles: number[][]; width_m: number }[])
  for (const problem of auditReservedLand({ id: doc.id, bounds: bounds, paths: paths, areas: areas, metres: TILE_M })) failures.push(`${doc.id}: ${problem}`)
}
const habitatKinds = new Map(
  Object.entries(MONSTER_KINDS).map((entry6) => {
    const id = entry6[0]
    const kind = entry6[1]
    return [`monster-${id}`, kind]
  }),
)
for (const entry7 of Object.entries(MAPS)) {
  const id = entry7[0]
  const map = entry7[1]

  const document = documents.get(`map-${id}`)
  if (!document) continue
  for (const problem of auditEcologyZones({ document, map, kinds: habitatKinds, spawns: SPAWNS })) failures.push(`${document.id}: ${problem}`)
}
for (const entry8 of Object.entries(MONSTER_KINDS)) {
  const id = entry8[0]
  const kind = entry8[1]

  const document = documents.get(`monster-${id}`)
  if (document) {
    const appearanceError = getMonsterAppearanceError({ appearance: document.appearance, kind })
    if (appearanceError) failures.push(`${document.id}: ${appearanceError.message}`)
    for (const problem of auditMonsterEcology({
      document: document,
      expected: { habitats: [...new Set(SPAWNS.filter((spawn) => spawn.kind === id).map((spawn) => `map-${spawn.map}`))], drops: kind.drops.map((drop) => drop.item) },
      documents: documents,
      items: new Set(Object.keys(ITEMS)),
    }))
      failures.push(`${document.id}: ${problem}`)
  }
}
for (const room of documents.values()) {
  const stockLockError = getStockLockReviewError(room, documents)
  if (stockLockError) failures.push(`${room.id}: ${stockLockError.message}`)
  if (room.stock_lock_site !== undefined) {
    const site = room.site,
      map = site && typeof site === "object" && "map" in site && typeof site.map === "string" ? site.map : null
    const layout = Object.entries(outdoorLayouts).find((entry) => `map-${entry[0]}` === map)?.[1]
    if (!layout || !map) failures.push(`${room.id}: Stock lock site has no outdoor map`)
    else {
      const pasture = layout.pasture,
        error = getStockLockSiteError({
          document: room,
          map,
          metresPerTile: TILE_M,
          pasture: [pasture.x0, pasture.z0, pasture.x1, pasture.z1],
          ground: {
            mapTiles: MAPS[map.replace(/^map-/, "")]?.size / 2,
            obstacles: [
              ...proposedRoofs
                .filter((house) => `map-${house.map}` === map)
                .map((house) => ({ id: `building-${house.id}`, rect: [house.x0, house.z0, house.x1, house.z1] satisfies readonly [number, number, number, number] })),
              ...facilityObstacles.filter((obstacle) => obstacle.map === map),
              ...(reservedLand.get(map) ?? []),
            ],
            corridors: [...layout.roads.map((road, index) => ({ id: `road-${index + 1}`, points: road.pts, halfWidth: road.w })), { id: "river", points: layout.river, halfWidth: layout.riverHW }],
          },
        })
      if (error) failures.push(`${room.id}: ${error.message}`)
    }
  }
  if (room.parked_cart_departure !== undefined) {
    const building = documents.get(String(room.building)),
      map = String(building?.map),
      layout = Object.entries(outdoorLayouts).find((entry) => entry[0] === map.replace(/^map-/, ""))?.[1]
    if (!layout) failures.push(`${room.id}: Cart apron has no outdoor map`)
    else
      for (const error of getCartApronSiteErrors({
        room,
        documents,
        metresPerTile: TILE_M,
        ground: {
          mapTiles: MAPS[map.replace(/^map-/, "")]?.size / 2,
          obstacles: [...outdoorObstacles.filter((obstacle) => obstacle.map === map), ...(reservedLand.get(map) ?? [])],
          corridors: [...layout.roads.map((road, index) => ({ id: `road-${index + 1}`, points: road.pts, halfWidth: road.w })), { id: "river", points: layout.river, halfWidth: layout.riverHW }],
        },
      }))
        failures.push(`${room.id}: ${error}`)
  }
  const cartDepartureError = getParkedCartDepartureError(room, documents)
  if (cartDepartureError) failures.push(`${room.id}: ${cartDepartureError.message}`)
  const error = getDishwaterCaptureError({ room, documents }),
    kitchenError = getKitchenWaterCycleError({ room, documents })
  if (error) failures.push(`${room.id}: ${error.message}`)
  if (kitchenError) failures.push(`${room.id}: ${kitchenError.message}`)
}
for (const document of documents.values())
  failures.push(...auditOpenDoorPassages(document, documents), ...auditDishDrying(document), ...auditSeatedMeal(document, documents), ...auditPlaceSettings(document, documents))
for (const document of documents.values()) {
  failures.push(...auditPotableWaterSupply(document, documents))
  if (document.potable_water_supply !== undefined) {
    const error = getWaterVesselGripReviewError({ room: document, documents, metresPerTile: TILE_M })
    if (error) failures.push(`${document.id}: ${error.message}`)
    const pickup = getWaterPickupReviewError({ room: document, documents })
    if (pickup) failures.push(`${document.id}: ${pickup.message}`)
  }
  if (document.water_collection === undefined) continue
  const site = document.site
  if (!site || typeof site !== "object" || !("map" in site) || typeof site.map !== "string") {
    failures.push(`${document.id}: Water landing has no native map layout`)
    continue
  }
  const id = site.map.replace(/^map-/, ""),
    map = MAPS[id],
    layout = Object.entries(outdoorLayouts).find((entry) => entry[0] === id)?.[1]
  if (!map || !layout) {
    failures.push(`${document.id}: Water landing has no native map layout`)
    continue
  }
  const error = getWaterCollectionLandingError({ document, documents, map, anchorTiles: layout.plaza, metresPerTile: TILE_M })
  if (error) failures.push(`${document.id}: ${error.message}`)
}
failures.push(
  ...auditTextileOrders(documents),
  ...auditStorageRetrievals(documents),
  ...auditDoorPushes(documents),
  ...auditRuntimeStations(documents, STATIONS),
  ...auditClassrooms(documents, ROUTINES),
  ...auditFurnitureMaintenance(documents),
  ...auditSleepingPlaces(documents),
  ...auditGuestSleepingPlaces(documents),
  ...auditPersonalStorage(documents),
  ...auditDesignDependencies(documents),
  ...auditResidentRoutineSources(documents, ROUTINES),
  ...auditResidentAppearanceSources({ documents, residents: RESIDENTS, looks: RESIDENT_LOOKS }),
  ...auditSettingReferenceTypes(documents),
  ...auditWorkerAssignments(documents),
  ...auditHouseholdMeals(documents),
  ...auditRoomWorkUses(documents, ROUTINES),
  ...auditLaundryDrying(documents),
  ...auditGroundStorage(documents),
  ...auditHotWork(documents),
  ...auditAnimalCare(documents, townAnimalSpawns()),
  ...auditSanitation(documents),
  ...auditTransportContainers(documents),
  ...auditTransportLoads(documents),
)
if (failures.length) {
  console.error(failures.join("\n"))
  process.exitCode = 1
} else {
  const grids = [...documents.values()].filter((doc) => doc.grid).length
  const pending = [...documents.values()].filter((doc) => doc.design_gate !== "通過").length
  const studies = [...documents.values()].filter((doc) => doc.town_district_plan !== undefined).length
  console.log(`資料 ${documents.size} 件、グリッド ${grids} 件、区画案 ${studies} 件。対象の網羅・参照・配置検査は通過。設計未完了 ${pending} 件。`)
  if (options["require-designed"] && pending) process.exitCode = 1
}
