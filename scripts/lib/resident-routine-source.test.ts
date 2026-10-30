import { expect, it } from "vitest"
import { auditResidentRoutineSources } from "./resident-routine-source"
import type { SettingDocument } from "#/scripts/lib/setting-document"
function fixture() {
  const doc: SettingDocument = {
    id: "resident-アンナ",
    kind: "residents",
    title: "アンナ",
    source: "test",
    status: "設計中",
    design_gate: "未通過",
    issues: [],
    routine_source: { file: "world/town/routines.ts", export: "ROUTINES", key: "アンナ" },
  }
  const routines = { アンナ: [{ from: 0, where: "home", doing: "眠る" }], クララ: [{ from: 0, where: "home", doing: "眠る" }] }
  return { doc, documents: new Map([[doc.id, doc]]), routines }
}
it("resolves the resident's schedule without storing another copy of its times", () => {
  const f = fixture()
  expect(auditResidentRoutineSources(f.documents, f.routines)).toEqual([])
  f.routines.アンナ[0].from = 123
  expect(auditResidentRoutineSources(f.documents, f.routines)).toEqual([])
})
it("rejects a copied schedule even when its source reference is correct", () => {
  const f = fixture()
  f.doc.routine = [{ from: 0, where: "home", doing: "眠る" }]
  expect(auditResidentRoutineSources(f.documents, f.routines)).toContain("resident-アンナ: runtime schedule must be referenced, not copied")
})
it("requires an explicit source rather than silently filling in the resident's name", () => {
  const f = fixture()
  delete f.doc.routine_source
  expect(auditResidentRoutineSources(f.documents, f.routines)).toContain("resident-アンナ: missing or invalid routine source")
})
it("does not resolve a different resident's valid schedule", () => {
  const f = fixture()
  f.doc.routine_source = { file: "world/town/routines.ts", export: "ROUTINES", key: "クララ" }
  expect(auditResidentRoutineSources(f.documents, f.routines)).toContain("resident-アンナ: routine source belongs to another resident")
})
it("rejects renamed or missing exports instead of executing arbitrary source paths", () => {
  const f = fixture()
  f.doc.routine_source = { file: "world/town/routines.ts", export: "SCHEDULES", key: "アンナ" }
  expect(auditResidentRoutineSources(f.documents, f.routines)).toContain("resident-アンナ: missing or invalid routine source")
})
it("requires a real nonempty runtime definition", () => {
  const f = fixture()
  expect(auditResidentRoutineSources(f.documents, {})).toContain("resident-アンナ: referenced routine does not exist")
  expect(auditResidentRoutineSources(f.documents, { アンナ: [] })).toContain("resident-アンナ: referenced routine does not exist")
  expect(auditResidentRoutineSources(f.documents, Object.create({ アンナ: [{}] }))).toContain("resident-アンナ: referenced routine does not exist")
})
