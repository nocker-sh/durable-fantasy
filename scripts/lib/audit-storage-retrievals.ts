import type { SettingDocument } from "#/scripts/lib/setting-document"
import { auditStorageRetrieval } from "#/scripts/lib/audit-storage-retrieval"

/** Ceiling checks run after all room and building documents have been loaded. */
export function auditStorageRetrievals(documents: ReadonlyMap<string, SettingDocument>): string[] {
  return [...documents.values()].filter((room) => room.kind === "rooms").flatMap((room) => auditStorageRetrieval(room, documents.get(String(room.building))).map((error) => `${room.id}: ${error}`))
}
