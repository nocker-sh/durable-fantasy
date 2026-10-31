import { expect, it } from "vitest"
import { getAuthoredExportTargets } from "#/scripts/lib/get-authored-export-targets"
import type { SettingIndexEntry } from "#/scripts/lib/setting-index"

const entries: SettingIndexEntry[] = [
  { id: "building-h-m5", kind: "buildings", file: "buildings/building-h-m5.md" },
  { id: "building-bakery", kind: "buildings", file: "buildings/building-bakery.md" },
]
it("preserves the existing default and explicit target order without sharing the caller's array", () => {
  expect(getAuthoredExportTargets([], entries)).toEqual(["building-h-m5"])
  const ids = ["building-bakery", "building-h-m5"],
    selected = getAuthoredExportTargets(ids, entries)
  ids.reverse()
  expect(selected).toEqual(["building-bakery", "building-h-m5"])
})
it.each(["building-unknown", "h-m5", "room-h-m5", "building-../outside", "building-%2foutside", "building-name?other", "building-name#other"])("rejects an unindexed or unsafe target %s", (id) => {
  const indexed: SettingIndexEntry[] = id === "building-unknown" ? entries : [...entries, { id, kind: "buildings", file: `buildings/${id}.md` }]
  expect(() => getAuthoredExportTargets([id], indexed)).toThrow("Unknown authored export building")
})
it("does not hide duplicate targets or duplicated index identities", () => {
  expect(() => getAuthoredExportTargets(["building-h-m5", "building-h-m5"], entries)).toThrow("Duplicate authored export target")
  expect(() => getAuthoredExportTargets([], [...entries, entries[0]])).toThrow("Duplicate settings index identity")
  expect(() => getAuthoredExportTargets([], [])).toThrow("Unknown authored export building")
})
