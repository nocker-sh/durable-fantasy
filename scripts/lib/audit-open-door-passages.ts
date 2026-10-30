import { openDoorPassagesSchema } from "#/scripts/lib/open-door-passages-schema"
import { getRoomDoorPortals } from "#/scripts/lib/get-room-door-portals"
import { getRoomOpenDoorObstacles } from "#/scripts/lib/get-room-open-door-obstacles"
import { getOpenDoorEntryError } from "#/scripts/lib/get-open-door-entry-error"
import { MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Cover every doorway with open panels present; the planar walking review never approves the opening operation or native body. */
export function auditOpenDoorPassages(room: SettingDocument, documents: ReadonlyMap<string, SettingDocument>): readonly string[] {
  if (room.open_door_passages === undefined) return []
  const parsed = openDoorPassagesSchema.safeParse(room.open_door_passages),
    portals = getRoomDoorPortals(room),
    obstacles = getRoomOpenDoorObstacles({ room, documents })
  if (!parsed.success || room.kind !== "rooms") return [`${room.id}: Invalid open door passage review`]
  if (portals instanceof Error) return [`${room.id}: ${portals.message}`]
  if (obstacles instanceof Error) return [`${room.id}: ${obstacles.message}`]
  const plan = parsed.data,
    errors: string[] = [],
    declared = new Set(plan.entries.map((entry) => entry.door.join(",")))
  if (plan.body_radius_m * 2 < MIN_PASSAGE_WIDTH_M) errors.push("Open passage body is smaller than the design width")
  if (declared.size !== plan.entries.length || declared.size !== portals.length || portals.some((portal) => !declared.has(portal.door.join(","))))
    errors.push("Open passages do not cover every doorway exactly once")
  for (const entry of plan.entries) {
    const error = getOpenDoorEntryError({ room, documents, plan, entry, obstacles })
    if (error) errors.push(`Door ${entry.door.join(",")}: ${error.message}`)
  }
  if (room.design_gate === "通過") errors.push("Planar open passages do not certify native operation or a completed room")

  return errors.map((error) => `${room.id}: ${error}`)
}
