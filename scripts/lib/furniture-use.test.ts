import { expect, it } from "vitest"
import { auditFurnitureUse } from "#/scripts/lib/furniture-use"
import type { SettingDocument } from "#/scripts/lib/setting-document"
function document(): SettingDocument {
  return {
    id: "room-a",
    kind: "rooms",
    title: "寝間",
    source: "test",
    status: "設計中",
    design_gate: "未通過",
    issues: [],
    grid: { cell_m: 0.5, rows: ["#######", "#...BB#", "#...BB#", "#...BB#", "#...BB#", "#.....#", "###D###"] },
    furniture: [{ symbol: "B", name: "寝台", owner: "住民", source: "大工", rect: [4, 1, 2, 4], access: [[3, 3]], use_space: [{ activity: "寝具を整える", rect: [2, 2, 2, 2] }] }],
  }
}
it("checks the person's operating area independently from the bed's occupied area", () => {
  expect(auditFurnitureUse(document())).toEqual([])
})
it("rejects a half-metre sliver even though the use point lies on reachable floor", () => {
  const doc = document()
  doc.furniture![0].use_space![0].rect = [3, 2, 1, 2]
  expect(auditFurnitureUse(doc)).toContain("B: operating space is too narrow")
})
it("does not count the bed itself or a doorway as clear operating floor", () => {
  const doc = document()
  doc.furniture![0].use_space![0].rect = [3, 2, 2, 2]
  expect(auditFurnitureUse(doc)).toContain("B: operating space is not clear floor")
  doc.furniture![0].use_space![0].rect = [2, 5, 2, 2]
  expect(auditFurnitureUse(doc)).toContain("B: operating space is not clear floor")
})
it("does not substitute an unrelated empty patch of floor for the furniture's use position", () => {
  const doc = document()
  doc.furniture![0].use_space![0].rect = [1, 1, 2, 2]
  expect(auditFurnitureUse(doc)).toContain("B: use position lies outside operating space")
})
it("allows incomplete drafts but requires operating space before passing a room design", () => {
  const doc = document()
  doc.furniture![0].use_space = undefined
  expect(auditFurnitureUse(doc)).toEqual([])
  doc.design_gate = "通過"
  expect(auditFurnitureUse(doc)).toContain("B: no operating space is designed")
})
it("checks every declared operation rather than accepting an unrelated extra area", () => {
  const doc = document()
  doc.furniture![0].use_space!.push({ activity: "着替える", rect: [1, 1, 2, 2] })
  expect(auditFurnitureUse(doc)).toContain("B: operating space has no use position")
})
function sharedRoom(): SettingDocument {
  const doc = document()
  doc.occupants = ["ヘレナ", "リーゼル"]
  doc.grid = { cell_m: 0.5, rows: ["##########", "#A.....B.#", "#........#", "#........#", "#........#", "####DD####"] }
  doc.furniture = [
    { symbol: "A", name: "炉", owner: "世帯", source: "石工", rect: [1, 1, 1, 1], access: [[2, 1]], use_space: [{ activity: "調理", rect: [2, 1, 2, 2] }] },
    { symbol: "B", name: "縫い台", owner: "世帯", source: "大工", rect: [7, 1, 1, 1], access: [[6, 1]], use_space: [{ activity: "繕い物", rect: [5, 1, 2, 2] }] },
  ]
  doc.parallel_use = [
    {
      activity: "調理と繕い物",
      operations: [
        { resident: "ヘレナ", furniture: "B", space_index: 0 },
        { resident: "リーゼル", furniture: "A", space_index: 0 },
      ],
    },
  ]
  return doc
}
it("accepts separately usable areas for two occupants", () => {
  expect(auditFurnitureUse(sharedRoom())).toEqual([])
})
it("rejects overlapping areas even when each operation has enough clear floor", () => {
  const doc = sharedRoom()
  doc.furniture![0].use_space![0].rect = [2, 1, 4, 2]
  expect(auditFurnitureUse(doc)).toEqual(["調理と繕い物: simultaneous operating spaces overlap"])
})
it("allows operating areas to share an edge without counting it as occupied area", () => {
  const doc = sharedRoom()
  doc.furniture![0].use_space![0].rect = [2, 1, 3, 2]
  expect(auditFurnitureUse(doc)).toEqual([])
})
it("does not count two simultaneous operations as two different people", () => {
  const doc = sharedRoom()
  doc.parallel_use![0].operations[1].resident = "ヘレナ"
  expect(auditFurnitureUse(doc)).toContain("調理と繕い物: one person cannot perform simultaneous operations")
})
it("requires a real occupant and an existing furniture operation", () => {
  const doc = sharedRoom()
  doc.parallel_use![0].operations[1] = { resident: "ヨーゼフ", furniture: "Q", space_index: 0 }
  expect(auditFurnitureUse(doc)).toEqual(["調理と繕い物: user is not a room occupant", "調理と繕い物: missing operating space"])
})
