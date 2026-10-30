import { getCookingTop } from "#/scripts/lib/get-cooking-top"
import { getAuthoredRoomUse } from "#/scripts/lib/get-authored-room-use"
import { auditAshReceivers } from "./ash-receiver"
import { auditNativeWorkPose } from "./native-work-pose"
import { auditHearthHandoff } from "./hearth-handoff"
import { auditHearthCarry } from "./hearth-carry"
import { hearthDimensions } from "./hearth-dimensions"
import { auditStorageRetrieval } from "#/scripts/lib/audit-storage-retrieval"
import { shelfDimensions } from "./shelf-dimensions"
import { bedDimensions } from "./bed-dimensions"
import { entryOpeningHeight } from "#/scripts/lib/entry-opening-height"
import { workSurface } from "./work-surface"
import { seatDimensions } from "./seat-dimensions"
import { compileActivitySpots } from "./activity-spots"
import { compileRoomDetails } from "./room-details"
import { compileRoomFixtures } from "./room-fixtures"
import { compileEnvelope } from "./building-envelope"
import { compileFlues } from "./flue-sections"
import { auditStairSections } from "./stair-sections"
import { parseFurnitureKind } from "#/world/town/parse-furniture-kind"
import { assertAuthoredFloorLevels } from "#/world/town/floorplan/assert-authored-floor-levels"
import { authoredFloorPlan } from "#/world/town/floorplan/authored"
import type { AuthoredPlan, AuthoredRoom } from "#/world/town/floorplan/authored"
import { auditRoomGrid } from "#/scripts/lib/audit-room-grid"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Compile one building from its setting documents; runtime adoption is explicit in HOUSES. */
export function compileAuthoredPlan(building: SettingDocument, documents: readonly SettingDocument[]): AuthoredPlan {
  const layout = building.layout as { cell_m: number; width: number; depth: number; floors: { floor: number; rooms: string[] }[] } | undefined
  if (building.kind !== "buildings" || !layout) throw new Error("Building layout required")
  const levels = building.floor_levels as { floor: number; elevation_m: number; ceiling_elevation_m: number }[]
  if (!Array.isArray(levels)) throw new Error("Authored floor levels are incomplete")
  const foundation = building.foundation as { floor_thickness_m: number } | undefined
  const floorLevels = levels.map((level) => ({
    floor: level.floor,
    elevation: level.elevation_m,
    ceiling: level.ceiling_elevation_m,
    thickness: level.floor === 0 ? Number(foundation?.floor_thickness_m) : level.elevation_m - Number(levels.find((below) => below.floor === level.floor - 1)?.ceiling_elevation_m),
  }))
  assertAuthoredFloorLevels(floorLevels, layout.floors.length)
  const byId = new Map(documents.map((room) => [room.id, room]))
  const stairErrors = auditStairSections(building, byId)
  if (stairErrors.length) throw new Error(stairErrors.join("; "))
  const rooms: AuthoredRoom[] = [],
    entries: { at: [number, number]; side: AuthoredPlan["entrySide"]; width: number }[] = []
  for (const level of layout.floors)
    for (const id of level.rooms) {
      const room = byId.get(id)
      if (!room || room.building !== building.id || room.floor !== level.floor || !room.grid || room.grid.cell_m !== layout.cell_m) throw new Error(`Missing or inconsistent authored room: ${id}`)
      const gridErrors = [
        ...auditRoomGrid(room),
        ...auditAshReceivers(room, building, byId),
        ...auditStorageRetrieval(room, building),
        ...auditHearthCarry(room, building),
        ...auditHearthHandoff(room, building, byId),
        ...auditNativeWorkPose(room, building, byId),
      ]
      if (gridErrors.length) throw new Error(`${id}: ${gridErrors.join("; ")}`)
      const origin = room.origin as [number, number]
      if (!Array.isArray(origin) || origin.length !== 2) throw new Error(`Missing room origin: ${id}`)
      const connections = room.connections as { target: string; door?: [number, number]; width_cells?: number }[] | undefined
      for (const c of connections ?? [])
        if (c.target === building.map && level.floor === 0) {
          if (!c.door) throw new Error(`Missing entrance position: ${id}`)
          const xState = c.door,
            x = xState[0],
            z = xState[1]
          const gx = origin[0] + x,
            gz = origin[1] + z
          const side = gz === 0 ? "n" : gz === layout.depth - 1 ? "s" : gx === 0 ? "w" : gx === layout.width - 1 ? "e" : undefined
          if (!side) throw new Error(`Entrance is not on an exterior wall: ${id}`)
          const offset = ((c.width_cells ?? 1) - 1) / 2,
            horizontal = side === "n" || side === "s"
          entries.push({ at: [gx + (horizontal ? offset : 0), gz + (horizontal ? 0 : offset)], side, width: c.width_cells ?? 1 })
        }
      const use = getAuthoredRoomUse(room.use)
      if (use instanceof Error) throw new Error(`Unsupported authored use: ${id}/${room.use}`)
      rooms.push({
        id,
        name: String(room.room_name),
        use,
        floor: level.floor,
        origin,
        rows: room.grid.rows,
        furniture: (room.furniture ?? []).map((f) => {
          if (!f.runtime_kind || typeof f.runtime_solid !== "boolean" || f.rect.length !== 4) throw new Error(`Missing explicit renderer: ${id}/${f.symbol}`)
          const seat = f.runtime_kind === "chair" ? seatDimensions(f.seat, f.rect[2] * layout.cell_m, f.rect[3] * layout.cell_m) : undefined
          const cookingTop = f.cooking_top === undefined ? undefined : getCookingTop(f.cooking_top)
          if (cookingTop instanceof Error) throw cookingTop
          return {
            cookingTop,
            hearth: f.runtime_kind === "hearth" ? hearthDimensions(f.hearth) : undefined,
            hearthFront: f.hearth_front,
            shelf: f.runtime_kind === "shelf" ? shelfDimensions(f.shelf, f.rect[2] * layout.cell_m, f.rect[3] * layout.cell_m) : undefined,
            bed: f.runtime_kind === "bed" ? bedDimensions(f.bed, f.rect[2] * layout.cell_m, f.rect[3] * layout.cell_m) : undefined,
            workSurface: f.runtime_kind === "table" ? workSurface(f.work_surface, f.rect[2] * layout.cell_m, f.rect[3] * layout.cell_m) : undefined,
            seat,
            wallMount: f.wall_mount ? { side: f.wall_mount.side, bottom: f.wall_mount.bottom_m, height: f.wall_mount.height_m } : undefined,
            symbol: f.symbol,
            name: f.name,
            kind: parseFurnitureKind(f.runtime_kind),
            solid: f.runtime_solid,
            rect: f.rect as [number, number, number, number],
          }
        }),
      })
    }
  if (entries.length !== 1) throw new Error("One authored entrance required")
  const result: AuthoredPlan = {
    id: building.id.replace(/^building-/, ""),
    cellM: layout.cell_m,
    width: layout.width,
    depth: layout.depth,
    floors: layout.floors.length,
    entry: entries[0].at,
    entrySide: entries[0].side,
    entryWidth: entries[0].width,
    entryHeight: entryOpeningHeight(building),
    rooms,
    activitySpots: compileActivitySpots(building, documents),
    details: compileRoomDetails(building, documents),
    ...compileRoomFixtures(building, documents),
    flues: compileFlues(building, byId),
    stairSections: [],
    floorLevels,
  }
  const sections = building.stair_sections as {
    lower_room: string
    upper_room: string
    furniture: string
    risers: number
    going_m: number
    axis: "x" | "y"
    lower_end: "start" | "end"
    landing_depth_m: number
    clear_width_m: number
    rail_inset_m: number
    opening_length_m: number
  }[]
  result.stairSections = sections.map((s) => {
    const lower = rooms.find((r) => r.id === s.lower_room),
      upper = rooms.find((r) => r.id === s.upper_room)
    const piece = lower?.furniture.find((f) => f.symbol === s.furniture)
    const lowerLevel = levels.find((l) => l.floor === lower?.floor),
      upperLevel = levels.find((l) => l.floor === upper?.floor)
    if (!lower || !upper || !piece || !lowerLevel || !upperLevel) throw new Error("Stair section lacks its rooms, furniture or elevations")
    const xState2 = piece.rect,
      x = xState2[0],
      z = xState2[1],
      w = xState2[2],
      d = xState2[3],
      k = layout.cell_m
    return {
      id: `${lower.id}/${piece.symbol}`,
      lowerFloor: lower.floor,
      upperFloor: upper.floor,
      x0: (lower.origin[0] + x) * k,
      z0: (lower.origin[1] + z) * k,
      x1: (lower.origin[0] + x + w) * k,
      z1: (lower.origin[1] + z + d) * k,
      height: upperLevel.elevation_m - lowerLevel.elevation_m,
      slabThickness: upperLevel.elevation_m - lowerLevel.ceiling_elevation_m,
      risers: s.risers,
      going: s.going_m,
      axis: s.axis === "y" ? "z" : "x",
      lowerEnd: s.lower_end,
      landing: s.landing_depth_m,
      clearWidth: s.clear_width_m,
      railInset: s.rail_inset_m,
      openingLength: s.opening_length_m,
    }
  })
  authoredFloorPlan(result)
  result.exterior = compileEnvelope(building, byId, result)
  return result
}
