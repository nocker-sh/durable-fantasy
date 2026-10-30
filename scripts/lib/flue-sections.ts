import { hearthParts } from "#/world/town/hearth-parts"
import { hearthDimensions } from "#/scripts/lib/hearth-dimensions"
import { flueWalls } from "#/world/town/flue-walls"
import { flueCorbelParts } from "#/world/town/flue-corbel"
import { MIN_STANDING_HEADROOM_M } from "#/scripts/lib/spatial-rules"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { FlueSection } from "#/world/town/floorplan/types"

/** Reserve the vertical route before the roof chimney or its interior shaft is drawn. */
export function compileFlues(building: SettingDocument, rooms: ReadonlyMap<string, SettingDocument>): FlueSection[] {
  const definitions = (building.flues ?? []) as {
    lower_room: string
    hearth: string
    upper_room: string
    shaft: string
    furniture_clearance_m: number
    floor_collar_m: number
    wall_thickness_m: number
    floor_support?: { depth_m: number; steps: number }
  }[]
  return definitions.map((def) => {
    const lower = rooms.get(def.lower_room),
      upper = rooms.get(def.upper_room)
    const hearth = lower?.furniture?.find((f) => f.symbol === def.hearth),
      shaft = upper?.furniture?.find((f) => f.symbol === def.shaft)
    if (
      !lower?.grid ||
      !upper?.grid ||
      !hearth ||
      !shaft ||
      hearth.runtime_kind !== "hearth" ||
      shaft.runtime_kind !== "chimney-shaft" ||
      lower.building !== building.id ||
      upper.building !== building.id ||
      Number(upper.floor) !== Number(lower.floor) + 1
    )
      throw new Error("Flue has no matching hearth and upper shaft")
    const rect = (room: SettingDocument, f: { rect: number[] }) => {
      const oxState = room.origin as number[],
        ox = oxState[0],
        oz = oxState[1],
        xState = f.rect,
        x = xState[0],
        z = xState[1],
        w = xState[2],
        d = xState[3],
        k = room.grid!.cell_m
      return { x0: (ox + x) * k, z0: (oz + z) * k, x1: (ox + x + w) * k, z1: (oz + z + d) * k }
    }
    if (!Number.isFinite(def.floor_collar_m) || def.floor_collar_m <= 0) throw new Error("Flue floor collar is missing")
    const a = rect(lower, hearth),
      b = rect(upper, shaft)
    if (b.x0 < a.x0 || b.z0 < a.z0 || b.x1 > a.x1 || b.z1 > a.z1) throw new Error("Upper flue is not supported by its hearth")
    if (!Number.isFinite(def.furniture_clearance_m) || def.furniture_clearance_m <= 0) throw new Error("Flue furniture clearance is missing")
    for (const room of rooms.values()) {
      if (room.kind !== "rooms" || !room.grid || room.building !== building.id) continue
      const hot = room.floor === upper.floor ? b : room.floor === lower.floor ? a : undefined
      if (!hot) continue
      for (const f of room.furniture ?? []) {
        if (f === shaft || f === hearth || f.runtime_kind === "chimney-shaft" || f.runtime_kind === "hearth") continue
        const r = rect(room, f),
          gap = Math.hypot(Math.max(r.x0 - hot.x1, hot.x0 - r.x1, 0), Math.max(r.z0 - hot.z1, hot.z0 - r.z1, 0))
        if (gap + 1e-9 < def.furniture_clearance_m)
          throw new Error(f.runtime_kind === "shelf" || f.role === "work_storage" ? "Flue intersects storage or lacks its clearance" : "Flue intersects furniture or lacks its clearance")
      }
    }
    flueWalls(b, def.wall_thickness_m)
    const support = def.floor_support
    if (!support) throw new Error("Flue floor support is missing")
    const result = {
      ...b,
      wallThickness: def.wall_thickness_m,
      floorCollar: def.floor_collar_m,
      floorSupport: { depth: support.depth_m, steps: support.steps },
      lowerFloor: Number(lower.floor),
      upperFloor: Number(upper.floor),
    }
    if (!hearth.hearth_front) throw new Error("Hearth has no front")
    const hearthSpec = hearthDimensions(hearth.hearth)
    hearthParts({ bounds: a, front: hearth.hearth_front, spec: hearthSpec, shaft: result, bottom: 0 })
    if (def.floor_collar_m > def.furniture_clearance_m) throw new Error("Flue collar exceeds furniture clearance")
    const layout = building.layout as { cell_m: number; width: number; depth: number } | undefined
    if (!layout) throw new Error("Flue support has no building bounds")
    flueCorbelParts(result, 0, { x0: 0, z0: 0, x1: layout.width * layout.cell_m, z1: layout.depth * layout.cell_m })
    const levels = building.floor_levels as { floor: number; elevation_m: number; ceiling_elevation_m: number }[] | undefined
    const level = levels?.find((level) => level.floor === result.lowerFloor)
    if (!level || !Number.isFinite(level.ceiling_elevation_m - level.elevation_m) || level.ceiling_elevation_m - level.elevation_m - support.depth_m < MIN_STANDING_HEADROOM_M)
      throw new Error("Flue floor support lacks standing headroom")
    if (hearthSpec.height >= level.ceiling_elevation_m - level.elevation_m) throw new Error("Hearth body leaves no vertical flue below the ceiling")
    return result
  })
}
