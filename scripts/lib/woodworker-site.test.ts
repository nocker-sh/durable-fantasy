import { z } from "zod"
import { auditEntrySteps } from "#/scripts/lib/audit-entry-steps"
import { entryStepsSchema } from "#/scripts/lib/entry-steps-schema"
import { entryStepGeometry } from "#/scripts/lib/entry-step-geometry"
import { auditSiteBounds } from "#/scripts/lib/audit-site-bounds"
import { plannedBuildingFootprints } from "#/scripts/lib/planned-building-footprints"
import { HOUSES } from "#/world/town/houses"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { ScalarField } from "#/lib/engine/scalar-field"
import { auditBuildingFoundation } from "#/scripts/lib/audit-building-foundation"
import { foundationSchema } from "#/scripts/lib/foundation-schema"
import { getPlannedMapRoads } from "#/scripts/lib/get-planned-map-roads"
import { readSetting } from "#/scripts/lib/read-setting"
import { readSettingIndex } from "#/scripts/lib/read-setting-index"
import { createGroundFields } from "#/world/maps/ground/create-ground-fields"
import { FR, GRID_N } from "#/world/maps/ground/rules"
import { CRAFT } from "#/world/maps/layouts/craft"
import { TILE_M } from "#/world/town/fit"

/** Read the canonical settings so proposed roads and the building's current site move together. */
function fixture() {
  const base = new URL("../../.docs/settings/", import.meta.url)
  const entries = readSettingIndex(JSON.parse(readFileSync(new URL("index.json", base), "utf8")))
  const documents = new Map(entries.map((entry) => [entry.id, readSetting(readFileSync(new URL(entry.file, base), "utf8"))]))
  const map = documents.get("map-phanthiet-craft")
  const building = documents.get("building-woodworker")
  if (!map || !building) throw new Error("Missing woodworker setting")

  const roads = getPlannedMapRoads({ map, roads: CRAFT.roads, documents })
  if (roads instanceof Error) throw roads

  const terrain = new ScalarField({ samples: createGroundFields({ ...CRAFT, roads }).h, size: GRID_N, resolution: FR })
  return { building, terrain, documents, roads }
}

it("keeps the woodworker's proposed floor clear of the whole site terrain", () => {
  const source = fixture()
  const before = JSON.stringify(source.building)
  expect(auditBuildingFoundation(source.building, source.terrain, TILE_M)).toEqual([])
  expect(JSON.stringify(source.building)).toBe(before)
  expect(source.building.status).toBe("設計中")
  expect(source.building.design_gate).toBe("未通過")
})

it("rejects a lower woodworker floor that loses its required ground gap", () => {
  const source = fixture()
  const foundation = foundationSchema.parse(source.building.foundation)
  source.building.foundation = { ...foundation, floor_elevation_m: foundation.floor_elevation_m - 0.02 }
  expect(auditBuildingFoundation(source.building, source.terrain, TILE_M)).toEqual(["Raised floor intersects terrain or lacks its designed ground gap"])
})

it("fits the woodworker entrance and both landings without occupying the road or neighbouring houses", () => {
  const source = fixture()
  const steps = z.array(entryStepsSchema).parse(source.building.entry_steps)
  expect(steps).toHaveLength(1)
  expect(auditEntrySteps({ building: source.building, documents: source.documents, terrain: source.terrain, metres: TILE_M })).toEqual([])
  const geometry = entryStepGeometry({ building: source.building, documents: source.documents, steps: steps[0], metres: TILE_M })
  if (!geometry) throw new Error("Missing woodworker entrance geometry")

  const houses = plannedBuildingFootprints({ houses: HOUSES, documents: source.documents, metresPerTile: TILE_M })
  expect(auditSiteBounds({ bounds: geometry.bounds, building: source.building, houses, roads: source.roads, mapTiles: 48 })).toEqual([])
  const formerBuilding = { ...source.building, site_plan: { origin: [13, 15.8], rotation_quarters: 0 } }
  const formerGeometry = entryStepGeometry({ building: formerBuilding, documents: source.documents, steps: steps[0], metres: TILE_M })
  if (!formerGeometry) throw new Error("Missing former entrance geometry")

  expect(auditSiteBounds({ bounds: formerGeometry.bounds, building: formerBuilding, houses, roads: source.roads, mapTiles: 48 })).toContain("Outdoor footprint covers road 1")
})
