import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { expect, it } from "vitest"
import { readSettingIndex } from "#/scripts/lib/read-setting-index"
import { readAuthoredPlanDocuments } from "#/scripts/lib/read-authored-plan-documents"
import { compileAuthoredPlan } from "#/scripts/lib/compile-authored-plan"
import generated from "#/world/town/floorplan/authored/h-m5"

const base = resolve(".docs/settings"),
  entries = readSettingIndex(JSON.parse(readFileSync(resolve(base, "index.json"), "utf8")))
it("resolves all declared rooms and the actual parent map while preserving the shipped plan", async () => {
  const documents = await readAuthoredPlanDocuments({ base, entries, buildingId: "building-h-m5" })
  expect(documents.rooms.map((room) => room.id)).toEqual(documents.building.rooms)
  expect(documents.map.id).toBe(documents.building.map)
  expect(compileAuthoredPlan(documents.building, documents.rooms, documents.map)).toEqual(generated)
})
it.each(["rooms", "maps"])("refuses a missing indexed %s reference instead of constructing a filename", async (kind) => {
  await expect(readAuthoredPlanDocuments({ base, entries: entries.filter((entry) => entry.kind !== kind), buildingId: "building-h-m5" })).rejects.toThrow("missing or ambiguous")
})
