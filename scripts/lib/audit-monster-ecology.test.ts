import { expect, it } from "vitest"
import { auditMonsterEcology } from "#/scripts/lib/audit-monster-ecology"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const base = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, source: "test", status: "設計中", design_gate: "未通過", issues: [] })
function fixture() {
  const species = {
    ...base("monster-slime", "monsters"),
    habitats: ["map-meadow"],
    ecology: { diet: "落果", water: "露", rest: "草むら", social: "小群", human_contact: "果樹園", reaction: "退く" },
    materials: [{ item: "jelly", origin: "逃げた後の粘液", users: ["resident-maker"], use: "糊" }],
  }
  const docs = new Map([
    ["map-meadow", { ...base("map-meadow", "maps"), monsters: [species.id] }],
    ["resident-maker", base("resident-maker", "residents")],
  ])
  const expected = { habitats: ["map-meadow"], drops: ["jelly"] },
    items = new Set(["jelly"])
  return { species, docs, check: () => auditMonsterEcology({ document: species, expected: expected, documents: docs, items: items }) }
}
it("checks ecology and material provenance against the actual species and map", () => {
  expect(fixture().check()).toEqual([])
})
it("catches a stale habitat even when its document still exists", () => {
  const f = fixture()
  f.species.habitats = ["map-other"]
  expect(f.check()).toContain("Document habitats disagree with registered spawns")
})
it("requires an explanation for each dropped material, without checking copied tuning numbers", () => {
  const f = fixture()
  f.species.materials = []
  expect(f.check()).toContain("Material provenance disagrees with registered drops")
})
it("does not accept the existence of a map as proof of reciprocal species membership", () => {
  const f = fixture()
  f.docs.get("map-meadow")!.monsters = []
  expect(f.check()).toContain("map-meadow: map does not reference species")
})
it("requires a known material user and each distinct ecology condition", () => {
  const f = fixture()
  f.species.materials[0].users = ["map-meadow"]
  f.species.ecology.water = ""
  expect(f.check()).toContain("jelly: unresolved material users")
  expect(f.check()).toContain("Missing ecology: water")
})
