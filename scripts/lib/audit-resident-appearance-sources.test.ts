import { expect, it } from "vitest"
import { auditResidentAppearanceSources } from "#/scripts/lib/audit-resident-appearance-sources"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const fixture = () => {
  const doc: SettingDocument = {
    id: "resident-ゾフィー",
    kind: "residents",
    title: "ゾフィー",
    source: "test",
    status: "設計中",
    design_gate: "未通過",
    issues: [],
    appearance_source: { file: "world/town/residents.ts", export: "RESIDENT_LOOKS", key: "ゾフィー" },
  }
  return { doc, documents: new Map([[doc.id, doc]]), residents: [{ name: "ヴィルヘルム" }, { name: "ゾフィー" }], looks: [{ neck: "scarf" }, { neck: "stole" }] }
}
it("resolves a resident by name instead of treating a document's order as its look index", () => {
  const f = fixture()
  expect(auditResidentAppearanceSources(f)).toEqual([])
  f.residents.reverse()
  f.looks.reverse()
  expect(auditResidentAppearanceSources(f)).toEqual([])
})
it("rejects a missing source, copied outfit, another resident and a raw-outfit export", () => {
  const f = fixture()
  delete f.doc.appearance_source
  expect(auditResidentAppearanceSources(f)).toContain("resident-ゾフィー: missing or invalid appearance source")
  f.doc.appearance_source = { file: "world/town/residents.ts", export: "RESIDENT_LOOKS", key: "ヴィルヘルム" }
  expect(auditResidentAppearanceSources(f)).toContain("resident-ゾフィー: missing or invalid appearance source")
  f.doc.appearance_source = { file: "world/town/residents.ts", export: "RESIDENTS", key: "ゾフィー" }
  expect(auditResidentAppearanceSources(f)).toContain("resident-ゾフィー: missing or invalid appearance source")
  f.doc.appearance_source = fixture().doc.appearance_source
  f.doc.appearance = { hat: "kerchief" }
  expect(auditResidentAppearanceSources(f)).toContain("resident-ゾフィー: runtime appearance must be referenced, not copied")
})
it("rejects missing and ambiguous runtime identities and absent rendered looks", () => {
  const f = fixture()
  expect(auditResidentAppearanceSources({ ...f, residents: [] })).not.toEqual([])
  expect(auditResidentAppearanceSources({ ...f, residents: [...f.residents, { name: "ゾフィー" }] })).not.toEqual([])
  expect(auditResidentAppearanceSources({ ...f, looks: [f.looks[0]] })).not.toEqual([])
})
