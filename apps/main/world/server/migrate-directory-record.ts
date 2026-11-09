import type { DirectoryRecord } from "#/world/server/directory-record-types"

/** Keep only the seat counts: the arrival time saved for every channel ever entered was never read and only grew. */
export function migrateDirectoryRecord(saved: unknown): DirectoryRecord {
  const counts = saved && typeof saved === "object" && "counts" in saved ? saved.counts : undefined
  // the counts are corrected by the rooms at the next arrival, so an unreadable table starts empty
  return { counts: counts && typeof counts === "object" ? (counts as DirectoryRecord["counts"]) : {} }
}
