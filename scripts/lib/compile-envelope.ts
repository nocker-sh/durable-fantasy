import { compileEnvelopeDoor } from "#/scripts/lib/compile-envelope-door"
import { assertEnvelopePlanDimensions } from "#/scripts/lib/assert-envelope-plan-dimensions"
import { assertFiniteEnvelope } from "#/scripts/lib/assert-finite-envelope"
import { getEnvelopeSource } from "#/scripts/lib/get-envelope-source"
import { getEnvelopeFlueOutlets } from "#/scripts/lib/get-envelope-flue-outlets"
import { getEnvelopeEntry } from "#/scripts/lib/get-envelope-entry"
import type { BuildingEnvelope } from "#/world/town/building-envelope"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"
import { TILE_M } from "#/world/town/fit"
import { entryStepGeometry } from "#/scripts/lib/entry-step-geometry"
import { SpatialFrame } from "#/lib/engine/spatial-frame"
import { compileEnvelopeWindow } from "#/scripts/lib/compile-envelope-window"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Compile site and interior dimensions together; presentation magnification stays indoors. */
export function compileEnvelope(
  building: SettingDocument,
  rooms: ReadonlyMap<string, SettingDocument>,
  plan: Pick<AuthoredPlan, "cellM" | "width" | "depth" | "flues" | "windows" | "floorLevels" | "entryHeight">,
): BuildingEnvelope {
  assertEnvelopePlanDimensions(building, plan)
  const source = getEnvelopeSource(building)
  const site = source.site_plan
  const foundation = source.foundation
  const roof = source.roof_section
  const definitions = source.entry_steps
  const entrance = entryStepGeometry({ building: building, documents: rooms, steps: definitions[0], metres: TILE_M })
  if (!entrance) throw new Error("Exterior entrance has no matching room doorway")
  const width = (plan.width * plan.cellM) / TILE_M,
    depth = (plan.depth * plan.cellM) / TILE_M,
    rotation = site.rotation_quarters
  const datum = foundation.floor_elevation_m
  const frame = new SpatialFrame({ origin: [site.origin[0], datum / TILE_M, site.origin[1]], width, depth, quarterTurns: rotation })
  const rect = (r: { x0: number; z0: number; x1: number; z1: number }): [number, number, number, number] => {
    const a = frame.toWorld([r.x0 / TILE_M, 0, r.z0 / TILE_M]),
      b = frame.toWorld([r.x1 / TILE_M, 0, r.z1 / TILE_M])
    return [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])]
  }
  const flues = getEnvelopeFlueOutlets(building.flues, plan.flues.length)
  const entry = getEnvelopeEntry(rooms.get(definitions[0].room), definitions[0].door)
  const railHeight = definitions[0].rail_height_m
  if (typeof railHeight !== "number" || !Number.isFinite(railHeight)) throw new Error("Exterior door leaf or entry rail height is missing")
  const door = compileEnvelopeDoor({ entry, entrance, frame, cellM: plan.cellM, entryHeight: plan.entryHeight, metresPerTile: TILE_M })
  const envelope: BuildingEnvelope = {
    windows: plan.windows.map((window) =>
      compileEnvelopeWindow({
        window,
        frame,
        floorLevels: plan.floorLevels,
        widthMetres: plan.width * plan.cellM,
        depthMetres: plan.depth * plan.cellM,
        wallMetres: plan.cellM,
        metresPerTile: TILE_M,
      }),
    ),
    id: building.id.replace(/^building-/, ""),
    bounds: [...site.origin, site.origin[0] + frame.size[0], site.origin[1] + frame.size[1]],
    floorY: datum / TILE_M,
    eaveY: (datum + roof.eave_underside_m) / TILE_M,
    ridgeY: (datum + roof.ridge_underside_m) / TILE_M,
    overhang: roof.overhang_m / TILE_M,
    ridgeAxis: (roof.ridge_axis === "x") !== (rotation % 2 === 1) ? "x" : "z",
    roof: roof.material,
    door,
    steps: entrance.surfaces.map((s) => ({ rect: s.rect, height: s.height / TILE_M })),
    railInset: definitions[0].rail_inset_m / TILE_M,
    railHeight: railHeight / TILE_M,
    chimneys: plan.flues.map((f, i) => ({ rect: rect(f), wallThickness: f.wallThickness / TILE_M, top: (datum + roof.ridge_underside_m + flues[i].outlet_above_ridge_m) / TILE_M })),
  }
  assertFiniteEnvelope(envelope)
  return envelope
}
