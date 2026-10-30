import { expect, it } from "vitest"
import { auditRuntimeGraphics } from "#/scripts/lib/audit-runtime-graphics"
import { auditRuntimeLayout } from "#/scripts/lib/audit-runtime-layout"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const source = "world/town/interiors.ts"
function fixture() {
  const pieces = [
    { floor: 0, name: "ろくろ" },
    { floor: 1, name: "釉の甕" },
  ]
  const document: SettingDocument = {
    id: "building-test",
    kind: "buildings",
    title: "窯場",
    status: "設計中",
    design_gate: "未通過",
    issues: [],
    source: "test",
    runtime_graphics_omissions: { source, pieces: [...pieces].reverse() },
  }
  return { document, actual: { source, pieces } }
}
it("compares live omissions without changing authored documents or treating ordering as a change", () => {
  const f = fixture(),
    before = JSON.stringify(f)
  expect(auditRuntimeGraphics(f.document, f.actual)).toEqual([])
  expect(JSON.stringify(f)).toBe(before)
})
it("detects deleted records and records cleared without implementing a renderer", () => {
  const f = fixture()
  delete f.document.runtime_graphics_omissions
  expect(auditRuntimeGraphics(f.document, f.actual)).toContain("Runtime graphics omissions disagree with the renderer")
  f.document.runtime_graphics_omissions = { source, pieces: [] }
  f.document.status = "描画照合済み"
  expect(auditRuntimeGraphics(f.document, f.actual)).toContain("Rendered setting still has unsupported runtime furniture")
})
it("detects stale notes, wrong floors and duplicate pieces rather than comparing just names", () => {
  const f = fixture()
  for (const pieces of [[], [{ floor: 1, name: "ろくろ" }, f.actual.pieces[1]], [...f.actual.pieces, f.actual.pieces[0]]]) {
    f.document.runtime_graphics_omissions = { source, pieces }
    expect(auditRuntimeGraphics(f.document, f.actual)).toContain("Runtime graphics omissions disagree with the renderer")
  }
})
it("requires notes to be removed when the renderer no longer omits those pieces", () => {
  const f = fixture()
  expect(auditRuntimeGraphics(f.document, { source, pieces: [] })).toContain("Runtime graphics omissions disagree with the renderer")
})
it("keeps design completion separate from rendering completion", () => {
  const f = fixture()
  f.document.status = "設計済み"
  f.document.design_gate = "通過"
  expect(auditRuntimeGraphics(f.document, f.actual)).toEqual([])
  f.document.status = "描画照合済み"
  expect(auditRuntimeGraphics(f.document, f.actual)).toContain("Rendered setting still has unsupported runtime furniture")
})
it("checks the renderer source and permits a rendered building with no remaining omissions", () => {
  const f = fixture()
  f.document.runtime_graphics_omissions = { source: "old-renderer.ts", pieces: f.actual.pieces }
  expect(auditRuntimeGraphics(f.document, f.actual)).toContain("Runtime graphics source does not match the renderer")
  delete f.document.runtime_graphics_omissions
  f.document.status = "描画照合済み"
  expect(auditRuntimeGraphics(f.document, { source, pieces: [] })).toEqual([])
})

it("checks omitted room inventories independently of supported furniture", () => {
  const f = fixture(),
    actual = { source: "world/town/floorplan/floor-plan.ts", rooms: [{ floor: 0, name: "燻し部屋" }] }
  expect(auditRuntimeLayout(f.document, actual)).toContain("Runtime layout omissions disagree with the floor plan")
  f.document.runtime_layout_omissions = { ...actual }
  f.document.status = "設計済み"
  expect(auditRuntimeLayout(f.document, actual)).toEqual([])
  f.document.status = "描画照合済み"
  expect(auditRuntimeLayout(f.document, actual)).toContain("Rendered setting still has unrepresented runtime rooms")
  f.document.runtime_layout_omissions = { source: actual.source, rooms: [] }
  expect(auditRuntimeLayout(f.document, actual)).toContain("Runtime layout omissions disagree with the floor plan")
})
it("does not discard room multiplicity, floors or stale source references", () => {
  const f = fixture(),
    room = { floor: 0, name: "物置" },
    actual = { source: "world/town/floorplan/floor-plan.ts", rooms: [room, room] }
  f.document.runtime_layout_omissions = { source: actual.source, rooms: [room] }
  expect(auditRuntimeLayout(f.document, actual)).toContain("Runtime layout omissions disagree with the floor plan")
  f.document.runtime_layout_omissions = { source: actual.source, rooms: [room, { ...room, floor: 1 }] }
  expect(auditRuntimeLayout(f.document, actual)).toContain("Runtime layout omissions disagree with the floor plan")
  f.document.runtime_layout_omissions = { ...actual, source: "old-floorplan.ts" }
  expect(auditRuntimeLayout(f.document, actual)).toContain("Runtime layout source does not match the floor plan")
  f.document.runtime_layout_omissions = actual
  expect(auditRuntimeLayout(f.document, { source: actual.source, rooms: [] })).toContain("Runtime layout omissions disagree with the floor plan")
})
