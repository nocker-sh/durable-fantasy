import { expect, it } from "vitest"
import { auditRuntimeStations } from "./runtime-stations"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Station } from "#/world/core/crafting-types"
const station: Station = { id: "forge", kind: "forge", name: "共同の炉", fee: 1, map: "craft", cell: [2, 3] }
const facility = (): SettingDocument => ({
  id: "facility-forge",
  kind: "facilities",
  title: "共同の炉",
  source: "test",
  status: "設計中",
  design_gate: "未通過",
  issues: [],
  runtime_station: "forge",
  site: { map: "map-craft" },
  design_dependencies: ["map-craft"],
})
it("matches authored equipment to a real station and its map without modifying the document", () => {
  const doc = facility(),
    before = JSON.stringify(doc)
  expect(auditRuntimeStations(new Map([[doc.id, doc]]), [station])).toEqual([])
  expect(JSON.stringify(doc)).toBe(before)
})
it("rejects a removed station and a moved station's stale site or dependency", () => {
  const doc = facility(),
    documents = new Map([[doc.id, doc]])
  expect(auditRuntimeStations(documents, [])).toEqual(["facility-forge: runtime station does not exist"])
  expect(auditRuntimeStations(documents, [{ ...station, map: "other" }])).toEqual([
    "facility-forge: facility site disagrees with its runtime station map",
    "facility-forge: runtime station map is missing from design dependencies",
  ])
})
it("does not let two documents claim the same runtime equipment or let a resident claim it", () => {
  const doc = facility(),
    duplicate = { ...doc, id: "duplicate" }
  expect(
    auditRuntimeStations(
      new Map([
        [doc.id, doc],
        [duplicate.id, duplicate],
      ]),
      [station],
    ),
  ).toContain("duplicate: runtime station is assigned to more than one facility")
  doc.kind = "residents"
  expect(auditRuntimeStations(new Map([[doc.id, doc]]), [station])).toContain("facility-forge: runtime station belongs to a facility")
})
