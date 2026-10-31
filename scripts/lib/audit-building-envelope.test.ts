import { expect, it } from "vitest"
import { auditBuildingEnvelope } from "#/scripts/lib/audit-building-envelope"
import type { SettingDocument } from "#/scripts/lib/setting-document"

function building(layout: unknown): SettingDocument {
  return { id: "building", kind: "buildings", title: "building", source: "test", status: "設計中", design_gate: "未通過", issues: [], layout, layout_scope: "whole-building" }
}
const envelope = { width_m: 1, depth_m: 1, scope: "whole-building" }

it.each([{ width: "1", depth: 1, cell_m: 1 }, { width: 1, depth: 1, cell_m: "1" }, { width: -1, depth: -1, cell_m: -1 }, { width: 0.5, depth: 0.5, cell_m: 2 }, 0, false, ""])(
  "rejects invalid dimensions even when numeric coercion or absence could hide them: %j",
  (layout) => {
    expect(auditBuildingEnvelope(building(layout), envelope)).toContain("Layout dimensions do not match the exterior definition")
  },
)
it("checks dimensions independently of room and floor metadata without rewriting it", () => {
  const document = building({ width: 2, depth: 2, cell_m: 0.5, notes: { owner: "test-household" } }),
    original = structuredClone(document)
  expect(auditBuildingEnvelope(document, envelope)).toEqual([])
  expect(document).toEqual(original)
})
it("retains a scope mismatch when the dimensions are also malformed", () => {
  const document = building({ width: "1", depth: 1, cell_m: 1 })
  document.layout_scope = "main-body"
  expect(auditBuildingEnvelope(document, envelope)).toEqual(["Layout scope does not match the exterior definition", "Layout dimensions do not match the exterior definition"])
})
it.each([null, undefined])("retains an explicitly absent layout: %j", (layout) => {
  expect(auditBuildingEnvelope(building(layout), envelope)).toEqual([])
})

it("rejects an inexact cell count even if the exterior dimensions match", () => {
  const document = building({ width: Number.MAX_SAFE_INTEGER, depth: 2, cell_m: 1 })
  expect(auditBuildingEnvelope(document, { width_m: Number.MAX_SAFE_INTEGER, depth_m: 2, scope: "whole-building" })).toEqual(["Layout dimensions do not match the exterior definition"])
})
