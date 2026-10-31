import { auditRoomGrid } from "#/scripts/lib/audit-room-grid"
import { auditAshReceivers } from "#/scripts/lib/ash-receiver"
import { auditStorageRetrieval } from "#/scripts/lib/audit-storage-retrieval"
import { auditHearthCarry } from "#/scripts/lib/hearth-carry"
import { auditHearthHandoff } from "#/scripts/lib/hearth-handoff"
import { auditNativeWorkPose } from "#/scripts/lib/native-work-pose"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Physical and work-use audits remain requirements of export, independently of renderer metadata. */
export function auditAuthoredRoom(room: SettingDocument, building: SettingDocument, documents: ReadonlyMap<string, SettingDocument>): string[] {
  return [
    ...auditRoomGrid(room),
    ...auditAshReceivers(room, building, documents),
    ...auditStorageRetrieval(room, building),
    ...auditHearthCarry(room, building),
    ...auditHearthHandoff(room, building, documents),
    ...auditNativeWorkPose(room, building, documents),
  ]
}
