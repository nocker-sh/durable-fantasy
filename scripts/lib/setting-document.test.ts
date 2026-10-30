import { expect, it } from "vitest"
import { auditRoomGrid } from "#/scripts/lib/audit-room-grid"
import { readSetting } from "#/scripts/lib/read-setting"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const document = (): SettingDocument => ({
  id: "room-test",
  kind: "rooms",
  title: "部屋",
  status: "設計中",
  source: "test",
  design_gate: "未通過",
  issues: [],
  bed_capacity: 0,
  grid: { cell_m: 0.5, rows: ["#####", "#BB.#", "#...#", "##D##"] },
  furniture: [{ symbol: "B", name: "寝台", owner: "住民", source: "大工", rect: [1, 1, 2, 1], access: [[1, 2]] }],
})
it("checks a reachable furniture use position against its actual footprint", () => {
  expect(auditRoomGrid(document())).toEqual([])
})
it("rejects a footprint that disagrees with the diagram", () => {
  const doc = document()
  doc.furniture![0].rect = [1, 1, 3, 1]
  expect(auditRoomGrid(doc)).toContain("B: footprint and grid disagree")
})
it("rejects disconnected use positions rather than accepting a room with some walkable cells", () => {
  const doc = document()
  doc.grid!.rows[2] = "#####"
  expect(auditRoomGrid(doc)).toContain("B: unreachable use position")
})
it("rejects conflicting furniture identities and unassigned symbols", () => {
  const doc = document()
  doc.furniture!.push({ ...doc.furniture![0] })
  doc.grid!.rows[1] = "#XB.#"
  expect(auditRoomGrid(doc)).toContain("Duplicate or invalid furniture symbol")
  expect(auditRoomGrid(doc)).toContain("Unknown grid symbol X")
})
it("does not equate a file or empty grid with a completed design", () => {
  const doc = document()
  doc.design_gate = "通過"
  expect(() => readSetting(`---\n${JSON.stringify(doc)}\n---\n`)).toThrow("Unresolved design")
  doc.status = "設計済み"
  doc.grid = null
  expect(() => readSetting(`---\n${JSON.stringify(doc)}\n---\n`)).toThrow("Room design needs a grid")
})

it("does not accept an arbitrary reachable floor cell as a furniture use position", () => {
  const doc = document()
  doc.furniture![0].access = [[2, 3]]
  expect(auditRoomGrid(doc)).toContain("B: use position is not beside furniture")
})

it("requires an assembled floor layout before a building can pass its design gate", () => {
  const doc = { ...document(), kind: "buildings", status: "設計済み", design_gate: "通過" }
  expect(() => readSetting(`---\n${JSON.stringify(doc)}\n---\n`)).toThrow("Building design needs a layout")
})
it("accepts an upper room entered through the declared stair endpoint, without inventing an exterior door", () => {
  const doc = document()
  doc.grid!.rows = ["#####", "#SS.#", "#...#", "#####"]
  doc.furniture![0].symbol = "S"
  doc.furniture![0].name = "階段"
  doc.connections = [{ kind: "stair", furniture: "S", access: [1, 2], target: "room-lower" }]
  expect(auditRoomGrid(doc)).toEqual([])
  doc.connections = [{ kind: "stair", furniture: "S", access: [3, 2], target: "room-lower" }]
  expect(auditRoomGrid(doc)).toContain("Stair entry has no matching reachable use position")
})
it("does not seed reachability from arbitrary unconnected furniture use positions", () => {
  const doc = document()
  doc.grid!.rows = ["#####", "#BB.#", "#...#", "#####"]
  expect(auditRoomGrid(doc)).toContain("Room has no doorway or stair entry")
})
it("rejects repeated unresolved issues instead of accumulating them with each edit", () => {
  const doc = document()
  doc.issues = ["未配置", "未配置"]
  expect(() => readSetting(`---\n${JSON.stringify(doc)}\n---\n`)).toThrow("Duplicate unresolved issues")
})
it("requires a real adjacent seat rather than just a chair label somewhere in the room", () => {
  const doc = document()
  doc.grid!.rows = ["######", "#BB.C#", "#....#", "##D###"]
  doc.furniture![0].name = "食卓"
  doc.furniture![0].seat_symbols = ["C"]
  doc.furniture!.push({ symbol: "C", name: "椅子", owner: "住民", source: "大工", role: "seat", rect: [4, 1, 1, 1], access: [[4, 2]] })
  expect(auditRoomGrid(doc)).toContain("B: seat is not beside its work surface")
  doc.grid!.rows[1] = "#BBC.#"
  doc.furniture![1].rect = [3, 1, 1, 1]
  doc.furniture![1].access = [[3, 2]]
  expect(auditRoomGrid(doc)).toEqual([])
  doc.furniture![1].role = "storage"
  expect(auditRoomGrid(doc)).toContain("B: unresolved seat")
})
it("reads valid authored prose and preserves unfamiliar metadata without filling in defaults", () => {
  const doc = { ...document(), custom_detail: { preserved: true } }
  const source = `---\n${JSON.stringify(doc)}\n---\n\n# 部屋\n\n住民が暮らす部屋。\n`
  expect(readSetting(source)).toEqual(doc)
  expect(readSetting(source.replaceAll("\n", "\r\n"))).toEqual(doc)
})
it.each([
  { furniture: [null] },
  { furniture: [{ symbol: "A", name: "机", owner: "住民", source: "大工", rect: [1, 1, 0, 2], access: [[1, 2]] }] },
  { origin: [0.5, 0] },
  { routine_source: { file: "world/town/routines.ts", export: "ROUTINES", key: 42 } },
  { appearance_source: { file: "world/town/residents.ts", export: "RESIDENT_LOOKS", key: 42 } },
  { floor_levels: [{ floor: 1, elevation_m: "high" }] },
  {
    stair_sections: [
      { lower_room: "room-a", upper_room: "room-b", furniture: "S", risers: 0, going_m: 0.28, axis: "y", lower_end: "end", landing_depth_m: 1, clear_width_m: 1, opening_length_m: null },
    ],
  },
  { connections: [{ kind: "teleport", target: "room-next" }] },
  { grid: { cell_m: 0, rows: ["##"] } },
  { site_plan: { origin: [1, 2], rotation_quarters: 4 } },
  { sleeping_places: [{ id: "bed-a", resident: null, kind: "個別寝台" }] },
  { parallel_use: [{ activity: "同時作業", operations: [] }] },
  {
    parallel_use: [
      {
        activity: "同時作業",
        operations: [
          { resident: "住民", furniture: "A", space_index: -1 },
          { resident: "同居人", furniture: "B", space_index: 0 },
        ],
      },
    ],
  },
])("rejects malformed nested metadata before geometry auditors use it: %j", (patch) => {
  const doc = { ...document(), ...patch }
  expect(() => readSetting(`---\n${JSON.stringify(doc)}\n---\n\n# 部屋\n\n生活の説明。\n`)).toThrow("Invalid settings structure")
})
it("requires prose and the declared object title, rather than counting metadata alone as a document", () => {
  const doc = document(),
    front = `---\n${JSON.stringify(doc)}\n---\n`
  expect(() => readSetting(front)).toThrow("Missing settings body")
  expect(() => readSetting(`${front}# 別の部屋\n\n説明。\n`)).toThrow("Missing settings body")
  expect(() => readSetting(`${front}# 部屋\n`)).toThrow("Missing settings body")
  expect(() => readSetting(`${front}# 部屋\n\n## 用途\n\n## 動線\n`)).toThrow("Missing settings body")
  expect(() => readSetting(`${front}# 部屋\n\n\`\`\`grid\n${doc.grid!.rows.join("\n")}\n\`\`\`\n`)).toThrow("Missing settings body")
  expect(() => readSetting(`${front}# 部屋\n\n<!-- 説明は未作成 -->\n`)).toThrow("Missing settings body")
})
it("checks the authored diagram against metadata instead of allowing a stale floor plan", () => {
  const doc = document()
  const source = `---\n${JSON.stringify(doc)}\n---\n\n# 部屋\n\n生活の説明。\n\n\`\`\`grid\n${doc.grid!.rows.join("\n")}\n\`\`\`\n`
  expect(readSetting(source)).toEqual(doc)
  expect(readSetting(source.replaceAll("\n", "\r\n"))).toEqual(doc)
  expect(() => readSetting(source.replace("#BB.#", "#B..#"))).toThrow("Grid diagram disagrees")
  expect(() => readSetting(source.replace('"grid":{', '"old_grid":{'))).toThrow("Grid diagram disagrees")
})

it("keeps unsupported source graphics distinct from design completion and rejects a false rendered status", () => {
  const doc = document()
  doc.runtime_graphics_omissions = { source: "world/town/interiors.ts", pieces: [{ name: "ろくろ", floor: 0 }] }
  const text = () => `---\n${JSON.stringify(doc)}\n---\n# ${doc.title}\n\n利用者と用途を検討する。\n`
  expect(readSetting(text()).runtime_graphics_omissions).toEqual(doc.runtime_graphics_omissions)
  doc.status = "描画照合済み"
  expect(() => readSetting(text())).toThrow("Rendered setting still has unsupported source furniture")
  doc.runtime_graphics_omissions = { source: "world/town/interiors.ts", pieces: [] }
  expect(readSetting(text()).status).toBe("描画照合済み")
})

it("does not call a source layout with omitted rooms visually verified", () => {
  const doc = document()
  doc.status = "描画照合済み"
  doc.runtime_layout_omissions = { source: "world/town/floorplan/floor-plan.ts", rooms: [{ floor: 0, name: "燻し部屋" }] }
  expect(() => readSetting(`---\n${JSON.stringify(doc)}\n---\n# ${doc.title}\n\n配置の理由。\n`)).toThrow("Rendered setting still has unrepresented source rooms")
})

const validSeat = { width_m: 0.4, depth_m: 0.4, height_m: 0.44, back_height_m: 0.9, board_thickness_m: 0.04, leg_width_m: 0.04 }
it("checks physical chair dimensions during the ordinary read-only room audit", () => {
  const doc = document()
  doc.furniture![0].runtime_kind = "chair"
  doc.furniture![0].seat = { ...validSeat }
  const before = structuredClone(doc)
  expect(auditRoomGrid(doc)).toEqual([])
  expect(doc).toEqual(before)
  doc.furniture![0].seat!.depth_m = 0.6
  expect(auditRoomGrid(doc)).toContain("B: Invalid chair dimensions")
})
it.each([undefined, null, [], { ...validSeat, height_m: "0.44" }, { ...validSeat, width_m: NaN }, { ...validSeat, leg_width_m: 0.2 }])(
  "reports malformed chair dimensions as an audit finding instead of crashing: %j",
  (seat) => {
    const doc = document()
    Object.assign(doc.furniture![0], { runtime_kind: "chair", seat })
    const errors = auditRoomGrid(doc)
    expect(errors.some((error) => /chair dimensions/.test(error))).toBe(true)
  },
)

it("rejects a foot board too narrow to meet either side bearer", () => {
  const doc = document()
  doc.furniture![0].runtime_kind = "chair"
  doc.furniture![0].seat = { ...validSeat, foot_rest: { height_m: 0.2, width_m: 0.1, depth_m: 0.1, forward_m: 0.2, thickness_m: 0.02 } }
  expect(auditRoomGrid(doc)).toContain("B: Invalid chair foot rest")
})
