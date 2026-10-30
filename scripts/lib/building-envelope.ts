import { doorLeafSection } from "#/world/town/door-leaf-section"
import { doorMovingThickness } from "#/world/town/door-moving-thickness"
import { doorHandleAlong } from "#/world/town/door-handle-along"
import type { BuildingEnvelope } from "#/world/town/building-envelope"
import type { AuthoredPlan } from "#/world/town/floorplan/authored"
import { TILE_M } from "#/world/town/fit"
import { entryStepGeometry } from "#/scripts/lib/entry-step-geometry"
import type { EntrySteps } from "#/scripts/lib/entry-steps-types"
import { roomDoorSwing } from "#/scripts/lib/room-door-swing"
import { doorAxes } from "#/scripts/lib/door-axes"
import { siteTransform } from "#/scripts/lib/site-transform"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Compile site and interior dimensions together; presentation magnification stays indoors. */
export function compileEnvelope(
  building: SettingDocument,
  rooms: ReadonlyMap<string, SettingDocument>,
  plan: Pick<AuthoredPlan, "cellM" | "width" | "depth" | "flues" | "windows" | "floorLevels" | "entryHeight">,
): BuildingEnvelope {
  const site = building.site_plan as { origin: [number, number]; rotation_quarters: number }
  const foundation = building.foundation as { floor_elevation_m: number }
  const roof = building.roof_section as { ridge_axis: "x" | "y"; eave_underside_m: number; ridge_underside_m: number; overhang_m: number; material: BuildingEnvelope["roof"] }
  const definitions = building.entry_steps as EntrySteps[]
  if (!site || !foundation || !roof || definitions?.length !== 1) throw new Error("Exterior needs a site, foundation, roof and one entrance stair")
  const entrance = entryStepGeometry({ building: building, documents: rooms, steps: definitions[0], metres: TILE_M })
  if (!entrance) throw new Error("Exterior entrance has no matching room doorway")
  const width = (plan.width * plan.cellM) / TILE_M,
    depth = (plan.depth * plan.cellM) / TILE_M,
    rotation = site.rotation_quarters
  const transform = siteTransform(width, depth, rotation)
  const rect = (r: { x0: number; z0: number; x1: number; z1: number }): [number, number, number, number] => {
    const a = transform.point(r.x0 / TILE_M, r.z0 / TILE_M),
      b = transform.point(r.x1 / TILE_M, r.z1 / TILE_M)
    return [site.origin[0] + Math.min(a[0], b[0]), site.origin[1] + Math.min(a[1], b[1]), site.origin[0] + Math.max(a[0], b[0]), site.origin[1] + Math.max(a[1], b[1])]
  }
  const flues = (building.flues ?? []) as { outlet_above_ridge_m: number }[]
  if (plan.flues.length !== flues.length || flues.some((f) => !Number.isFinite(f.outlet_above_ridge_m) || f.outlet_above_ridge_m <= 0)) throw new Error("Flue outlet height is missing")
  const entryRoom = rooms.get(definitions[0].room)
  const leaf = (entryRoom?.door_leaves as Parameters<typeof roomDoorSwing>[1][] | undefined)?.find((leaf) => leaf.door[0] === definitions[0].door[0] && leaf.door[1] === definitions[0].door[1])
  const thickness = leaf?.thickness_m,
    inset = leaf?.frame_inset_m
  if (
    !entryRoom ||
    !leaf ||
    typeof thickness !== "number" ||
    !Number.isFinite(thickness) ||
    thickness <= 0 ||
    typeof inset !== "number" ||
    !Number.isFinite(inset) ||
    inset < 0 ||
    !Number.isFinite(definitions[0].rail_height_m)
  )
    throw new Error("Exterior door leaf or entry rail height is missing")
  if (leaf.paired) throw new Error("Paired exterior door rendering is not supported")
  if (!leaf.vertical_clearance_m) throw new Error("Exterior door vertical clearances are missing")
  if (!leaf.fittings) throw new Error("Exterior door fitting projections are missing")
  doorMovingThickness(thickness, leaf.fittings)
  const section = doorLeafSection(plan.entryHeight, leaf.vertical_clearance_m)
  const swing = roomDoorSwing(entryRoom, leaf)
  if (!swing) throw new Error("Exterior door has no valid interior swing")
  if (leaf.fittings.handle_along_m === undefined) throw new Error("Exterior door grip position is missing")
  const handleAlong = doorHandleAlong(swing.radius, leaf.fittings.handle_along_m)
  const origin = entryRoom.origin as number[],
    closed = doorAxes(swing).closed
  const project = (x: number, z: number) => {
    const p = transform.point((origin[0] * plan.cellM + x) / TILE_M, (origin[1] * plan.cellM + z) / TILE_M)
    return [site.origin[0] + p[0], site.origin[1] + p[1]]
  }
  const hinge = project(swing.hinge[0], swing.hinge[1]),
    centre = project(swing.hinge[0] + (closed[0] * swing.radius) / 2, swing.hinge[1] + (closed[1] * swing.radius) / 2)
  const worldTangent = [-entrance.outward[1], entrance.outward[0]]
  const delta = entrance.upperPoint.map((v, i) => v - centre[i]),
    recess = delta[0] * entrance.outward[0] + delta[1] * entrance.outward[1]
  if (recess < 0 || Math.abs(delta[0] * worldTangent[0] + delta[1] * worldTangent[1]) > 1e-6) throw new Error("Exterior door does not align with its interior opening")
  const hingeSign = Math.sign((hinge[0] - centre[0]) * worldTangent[0] + (hinge[1] - centre[1]) * worldTangent[1])
  const datum = foundation.floor_elevation_m
  return {
    windows: plan.windows.map((window) => {
      const local =
        window.side === "n" ? [window.along, 0] : window.side === "s" ? [window.along, plan.depth * plan.cellM] : window.side === "w" ? [0, window.along] : [plan.width * plan.cellM, window.along]
      const offset = transform.point(local[0] / TILE_M, local[1] / TILE_M),
        normal = window.side === "n" ? [0, -1] : window.side === "s" ? [0, 1] : window.side === "w" ? [-1, 0] : [1, 0],
        direction = transform.direction(normal[0], normal[1])
      return {
        floor: window.floor,
        id: window.id,
        point: [site.origin[0] + offset[0], site.origin[1] + offset[1]],
        outward: direction,
        width: window.width / TILE_M,
        height: window.height / TILE_M,
        sill: (plan.floorLevels.find((level) => level.floor === window.floor)!.elevation + window.sill) / TILE_M,
        frame: window.frame / TILE_M,
        depth: plan.cellM / TILE_M,
      }
    }),
    id: building.id.replace(/^building-/, ""),
    bounds: [...site.origin, site.origin[0] + transform.size[0], site.origin[1] + transform.size[1]],
    floorY: datum / TILE_M,
    eaveY: (datum + roof.eave_underside_m) / TILE_M,
    ridgeY: (datum + roof.ridge_underside_m) / TILE_M,
    overhang: roof.overhang_m / TILE_M,
    ridgeAxis: (roof.ridge_axis === "x") !== (rotation % 2 === 1) ? "x" : "z",
    roof: roof.material,
    door: {
      point: entrance.upperPoint as [number, number],
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
    railHeight: Number(definitions[0].rail_height_m) / TILE_M,
    chimneys: plan.flues.map((f, i) => ({ rect: rect(f), wallThickness: f.wallThickness / TILE_M, top: (datum + roof.ridge_underside_m + flues[i].outlet_above_ridge_m) / TILE_M })),
  }
}
