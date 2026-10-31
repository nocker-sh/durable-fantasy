import { assertEnvelopePlanDimensions } from "#/scripts/lib/assert-envelope-plan-dimensions"
import { assertFiniteEnvelope } from "#/scripts/lib/assert-finite-envelope"
import { getEnvelopeSource } from "#/scripts/lib/get-envelope-source"
import { getEnvelopeFlueOutlets } from "#/scripts/lib/get-envelope-flue-outlets"
import { getEnvelopeEntry } from "#/scripts/lib/get-envelope-entry"
import { doorLeafSection } from "#/world/town/door-leaf-section"
import { doorMovingThickness } from "#/world/town/door-moving-thickness"
import { doorHandleAlong } from "#/world/town/door-handle-along"
import type { BuildingEnvelope } from "#/world/town/building-envelope"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"
import { TILE_M } from "#/world/town/fit"
import { entryStepGeometry } from "#/scripts/lib/entry-step-geometry"
import { roomDoorSwing } from "#/scripts/lib/room-door-swing"
import { doorAxes } from "#/scripts/lib/door-axes"
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
  const entryRoom = entry.room
  const leaf = entry.leaf
  const thickness = leaf.thickness_m
  const inset = leaf.frame_inset_m
  const railHeight = definitions[0].rail_height_m
  if (typeof railHeight !== "number" || !Number.isFinite(railHeight)) throw new Error("Exterior door leaf or entry rail height is missing")
  if (leaf.paired) throw new Error("Paired exterior door rendering is not supported")
  if (!leaf.vertical_clearance_m) throw new Error("Exterior door vertical clearances are missing")
  if (!leaf.fittings) throw new Error("Exterior door fitting projections are missing")
  doorMovingThickness(thickness, leaf.fittings)
  const section = doorLeafSection(plan.entryHeight, leaf.vertical_clearance_m)
  const swing = roomDoorSwing(entryRoom, leaf)
  if (!swing) throw new Error("Exterior door has no valid interior swing")
  if (leaf.fittings.handle_along_m === undefined) throw new Error("Exterior door grip position is missing")
  const handleAlong = doorHandleAlong(swing.radius, leaf.fittings.handle_along_m)
  const origin = entry.origin,
    closed = doorAxes(swing).closed
  const project = (x: number, z: number) => {
    const point = frame.toWorld([(origin[0] * plan.cellM + x) / TILE_M, 0, (origin[1] * plan.cellM + z) / TILE_M])
    return [point[0], point[2]]
  }
  const hinge = project(swing.hinge[0], swing.hinge[1]),
    centre = project(swing.hinge[0] + (closed[0] * swing.radius) / 2, swing.hinge[1] + (closed[1] * swing.radius) / 2)
  const worldTangent = [-entrance.outward[1], entrance.outward[0]]
  const delta = entrance.upperPoint.map((v, i) => v - centre[i]),
    recess = delta[0] * entrance.outward[0] + delta[1] * entrance.outward[1]
  if (recess < 0 || Math.abs(delta[0] * worldTangent[0] + delta[1] * worldTangent[1]) > 1e-6) throw new Error("Exterior door does not align with its interior opening")
  const hingeSign = Math.sign((hinge[0] - centre[0]) * worldTangent[0] + (hinge[1] - centre[1]) * worldTangent[1])
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
    door: {
      point: entrance.upperPoint,
      outward: entrance.outward,
      handleAlong: handleAlong / TILE_M,
      braceProjection: leaf.fittings.brace_projection_m / TILE_M,
      handleProjection: leaf.fittings.handle_projection_m / TILE_M,
      leafBottom: section.bottom / TILE_M,
      leafTop: section.top / TILE_M,
      recess,
      leafThickness: thickness / TILE_M,
      frameInset: inset / TILE_M,
      hingeSign,
      width: entrance.doorwayWidth / TILE_M,
      height: plan.entryHeight / TILE_M,
    },
    steps: entrance.surfaces.map((s) => ({ rect: s.rect, height: s.height / TILE_M })),
    railInset: definitions[0].rail_inset_m / TILE_M,
    railHeight: railHeight / TILE_M,
    chimneys: plan.flues.map((f, i) => ({ rect: rect(f), wallThickness: f.wallThickness / TILE_M, top: (datum + roof.ridge_underside_m + flues[i].outlet_above_ridge_m) / TILE_M })),
  }
  assertFiniteEnvelope(envelope)
  return envelope
}
