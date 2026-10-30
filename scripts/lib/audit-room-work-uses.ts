import { z } from "zod"
import { roomWorkUseSchema } from "#/scripts/lib/room-work-use-schema"
import { getRoomWorkUseError } from "#/scripts/lib/get-room-work-use-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Slot } from "#/world/town/routine-types"

const usesSchema = z.array(roomWorkUseSchema)

/** A declared shared-table job must not escape reference and completion checks. */
export function auditRoomWorkUses(documents: ReadonlyMap<string, SettingDocument>, routines: Readonly<Record<string, readonly Slot[]>>): string[] {
  return [...documents.values()].flatMap((room) => {
    if (room.work_uses === undefined) return []
    const parsed = usesSchema.safeParse(room.work_uses)
    if (!parsed.success) return [`${room.id}: invalid room work uses`]

    return parsed.data.flatMap((use) => {
      const error = getRoomWorkUseError({ room, use, documents, routines })
      return error ? [`${room.id}: ${error.message}`] : []
    })
  })
}
