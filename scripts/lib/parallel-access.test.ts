import { readSetting } from "#/scripts/lib/read-setting"
import { expect, it } from "vitest"
import { auditParallelAccess } from "./parallel-access"
import type { SettingDocument } from "#/scripts/lib/setting-document"
function fixture(): SettingDocument {
  return {
    id: "room-a",
    kind: "rooms",
    title: "台所",
    source: "test",
    status: "設計中",
    design_gate: "未通過",
    issues: [],
    occupants: ["カール", "ウルリケ"],
    grid: { cell_m: 0.5, rows: ["########", "#A.....#", "#......#", "#.....B#", "#......#", "#......#", "###DD###"] },
    furniture: [
      { symbol: "A", name: "棚", owner: "世帯", source: "大工", rect: [1, 1, 1, 1], access: [[2, 1]], use_space: [{ activity: "棚を使う", rect: [2, 1, 2, 2] }] },
      { symbol: "B", name: "調理台", owner: "世帯", source: "大工", rect: [6, 3, 1, 1], access: [[5, 3]], use_space: [{ activity: "調理する", rect: [4, 2, 2, 2] }] },
    ],
    parallel_use: [
      {
        activity: "調理と配膳",
        operations: [
          { resident: "カール", furniture: "A", space_index: 0 },
          { resident: "ウルリケ", furniture: "B", space_index: 0 },
        ],
      },
    ],
  }
}
it("allows both users to reach their area with the other area occupied", () => {
  expect(auditParallelAccess(fixture())).toEqual([])
})
it("detects a body blocking the only doorway without overlapping another workstation", () => {
  const doc = fixture()
  doc.furniture![1].use_space![0].rect = [3, 3, 3, 3]
  expect(auditParallelAccess(doc)).toContain("調理と配膳: other users block access for カール")
})
it("does not mutate the authored grid or furniture while reserving bodies", () => {
  const doc = fixture(),
    before = structuredClone(doc)
  auditParallelAccess(doc)
  expect(doc).toEqual(before)
})
it("leaves missing or overlapping operation errors to the operating-area audit", () => {
  const doc = fixture()
  doc.parallel_use![0].operations[1].furniture = "missing"
  expect(auditParallelAccess(doc)).toEqual([])
  doc.parallel_use![0].operations[1].furniture = "A"
  expect(auditParallelAccess(doc)).toEqual([])
})

it("keeps the inn's compact kitchen usable while all three declared workers stand at their stations", async () => {
  const { readFileSync } = await import("node:fs")
  const doc = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-inn-2.md", import.meta.url), "utf8"))
  expect(auditParallelAccess(doc)).toEqual([])
  const pantry = doc.furniture!.find((f) => f.symbol === "N")!
  pantry.use_space![0].rect = [11, 4, 2, 2]
  pantry.access = [[12, 4]]
  expect(auditParallelAccess(doc)).toContain("調理と清潔な食器の準備と食材の取出し: other users block access for ゼップ")
})
