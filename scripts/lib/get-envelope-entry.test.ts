import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { getEnvelopeSource } from "#/scripts/lib/get-envelope-source"
import { getEnvelopeEntry } from "#/scripts/lib/get-envelope-entry"

function fixture() {
  const building = readSetting(readFileSync(new URL("../../.docs/settings/buildings/building-h-m5.md", import.meta.url), "utf8"))
  const source = getEnvelopeSource(building)
  const stairs = source.entry_steps[0]
  const room = readSetting(readFileSync(new URL(`../../.docs/settings/rooms/${stairs.room}.md`, import.meta.url), "utf8"))
  return { room, door: stairs.door }
}

it("returns the original room with a measured entrance and preserves the source", () => {
  const source = fixture()
  const before = JSON.stringify(source.room)
  const entry = getEnvelopeEntry(source.room, source.door)
  expect(entry.room).toBe(source.room)
  expect(entry.leaf.door).toEqual(source.door)
  expect(entry.leaf.thickness_m).toBeGreaterThan(0)
  expect(JSON.stringify(source.room)).toBe(before)
})

it("rejects ambiguous, missing or unmeasured entrance leaves", () => {
  const source = fixture()
  const entry = getEnvelopeEntry(source.room, source.door)
  for (const invalid of [
    { ...source.room, door_leaves: [] },
    { ...source.room, door_leaves: [entry.leaf, entry.leaf] },
    { ...source.room, door_leaves: [{ ...entry.leaf, thickness_m: undefined }] },
    { ...source.room, origin: [Infinity, 0] },
  ])
    expect(() => getEnvelopeEntry(invalid, source.door)).toThrow("Exterior door leaf")
  expect(() => getEnvelopeEntry(undefined, source.door)).toThrow("Exterior door leaf")
})
