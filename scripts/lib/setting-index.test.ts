import { expect, it } from "vitest"
import { auditSettingInventory } from "#/scripts/lib/audit-setting-inventory"
import { readSettingIndex } from "#/scripts/lib/read-setting-index"
const entry = { id: "room-a", kind: "rooms" as const, file: "rooms/room-a.md" }
it("accounts for the files on disk, allowing only the root guide outside the index", () => {
  expect(auditSettingInventory([entry], [entry.file, "README.md"])).toEqual([])
  expect(auditSettingInventory([entry], [entry.file, "rooms/room-hidden.md"])).toContain("Unindexed document: rooms/room-hidden.md")
  expect(auditSettingInventory([entry], [])).toContain("Indexed document is missing: rooms/room-a.md")
})
it("does not hide duplicated identities or paths behind a map", () => {
  expect(auditSettingInventory([entry, entry], [entry.file])).toEqual(["Duplicate document ID: room-a", "Duplicate document path: rooms/room-a.md"])
})
it("validates the index version, kind, ID prefix and canonical relative path", () => {
  expect(readSettingIndex({ version: 1, entries: [entry] })).toEqual([entry])
  for (const invalid of [
    { ...entry, kind: "unknown" },
    { ...entry, id: "monster-a" },
    { ...entry, file: "../rooms/room-a.md" },
    { ...entry, id: "room-../other", file: "rooms/room-../other.md" },
    { ...entry, id: "room-", file: "rooms/room-.md" },
  ])
    expect(() => readSettingIndex({ version: 1, entries: [invalid] })).toThrow()
  expect(() => readSettingIndex({ version: 2, entries: [entry] })).toThrow("Invalid settings index")
})
