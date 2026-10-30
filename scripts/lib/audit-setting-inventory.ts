import type { SettingIndexEntry } from "#/scripts/lib/setting-index"

export function auditSettingInventory(entries: readonly SettingIndexEntry[], files: readonly string[]): string[] {
  const errors: string[] = [],
    ids = new Set<string>(),
    indexed = new Set<string>(),
    actual = new Set(files)
  for (const entry of entries) {
    if (ids.has(entry.id)) errors.push(`Duplicate document ID: ${entry.id}`)
    if (indexed.has(entry.file)) errors.push(`Duplicate document path: ${entry.file}`)
    ids.add(entry.id)
    indexed.add(entry.file)
    if (!actual.has(entry.file)) errors.push(`Indexed document is missing: ${entry.file}`)
  }
  for (const file of actual) if (file !== "README.md" && !indexed.has(file)) errors.push(`Unindexed document: ${file}`)
  return errors
}
