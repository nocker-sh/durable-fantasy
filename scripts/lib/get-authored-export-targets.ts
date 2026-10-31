import type { SettingIndexEntry } from "#/scripts/lib/setting-index"

/** Select explicit indexed buildings before any source is loaded or written; an omitted target retains the existing hall export. */
export function getAuthoredExportTargets(ids: readonly string[], entries: readonly SettingIndexEntry[]): readonly string[] {
  if (new Set(entries.map((entry) => entry.id)).size !== entries.length) throw new Error("Duplicate settings index identity")
  const targets = ids.length ? ids : ["building-h-m5"]
  if (new Set(targets).size !== targets.length) throw new Error("Duplicate authored export target")
  for (const id of targets)
    if (!/^building-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || !entries.some((entry) => entry.id === id && entry.kind === "buildings")) throw new Error(`Unknown authored export building: ${id}`)
  return [...targets]
}
