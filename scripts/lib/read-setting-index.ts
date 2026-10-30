import { SETTING_PREFIXES } from "#/scripts/lib/setting-index"
import type { SettingIndexEntry } from "#/scripts/lib/setting-index"

export function readSettingIndex(value: unknown): SettingIndexEntry[] {
  if (!value || typeof value !== "object" || !("version" in value) || value.version !== 1 || !("entries" in value) || !Array.isArray(value.entries)) throw Error("Invalid settings index")
  return value.entries.map((entry: unknown) => {
    if (
      !entry ||
      typeof entry !== "object" ||
      !("id" in entry) ||
      !("kind" in entry) ||
      !("file" in entry) ||
      typeof entry.id !== "string" ||
      typeof entry.kind !== "string" ||
      typeof entry.file !== "string" ||
      !Object.hasOwn(SETTING_PREFIXES, entry.kind)
    )
      throw Error("Invalid settings index entry")
    const kind = entry.kind as SettingIndexEntry["kind"]
    if (
      !entry.id.startsWith(`${SETTING_PREFIXES[kind]}-`) ||
      entry.id.length <= SETTING_PREFIXES[kind].length + 1 ||
      entry.id.includes("/") ||
      entry.id.includes("\\") ||
      [...entry.id].some((character) => character.charCodeAt(0) < 32) ||
      entry.file !== `${kind}/${entry.id}.md`
    )
      throw Error("Invalid settings identity or file path")
    return { id: entry.id, kind, file: entry.file }
  })
}
