import { expect, it } from "vitest"
import { assertSettingShape } from "#/scripts/lib/setting-shape"
import { auditRoomWorkUses } from "#/scripts/lib/audit-room-work-uses"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Slot } from "#/world/town/routine-types"

const document = (id: string, kind: string, title = id): SettingDocument => ({ id, kind, title, status: "設計中", source: "test", design_gate: "未通過", issues: [] })
const piece = (symbol: string) => ({ symbol, name: symbol, owner: "Berta", source: "test", rect: [0, 0, 1, 1], access: [[1, 0]] })
function fixture() {
  const use = {
    resident: "resident-b",
    routine_source: { file: "world/town/routines.ts", key: "Berta", doing: "repair" },
    furniture: "T",
    seat_symbol: "B",
    mode: "quiet-repair",
    storage_room: "storage",
    storage_symbol: "P",
    status: "proposed",
    pending: ["lighting"],
    kit: { owner: "resident-b", proposed_box_maker: "maker", proposed_needle_maker: "maker", thread_source: "own weaving", storage_compartment: "kit" },
  }
  const room: SettingDocument = {
    ...document("room", "rooms"),
    building: "home",
    design_dependencies: ["resident-b", "storage", "maker"],
    occupants: ["Berta"],
    furniture: [{ ...piece("T"), seat_symbols: ["B"] }, piece("B")],
    work_uses: [use],
  }
  const stored = {
    id: "kit",
    name: "Kit",
    owner: "Berta",
    source: "test",
    kind: "box",
    board: 0,
    across_m: 0,
    from_back_m: 0.01,
    width_m: 0.3,
    height_m: 0.1,
    depth_m: 0.2,
    wall_thickness_m: 0.01,
    lid_thickness_m: 0.01,
  }
  const shelf = { height_m: 1, board_thickness_m: 0.025, board_tops_m: [0.12, 1], front: "s", contents: [stored] }
  const storage: SettingDocument = { ...document("storage", "rooms"), building: "home", furniture: [{ ...piece("P"), role: "storage", compartments: ["kit"], shelf }] }
  const resident = document("resident-b", "residents", "Berta")
  const building: SettingDocument = { ...document("home", "buildings"), rooms: ["room", "storage"] }
  const documents = new Map([room, storage, resident, building, document("maker", "residents")].map((entry) => [entry.id, entry]))
  const routines: Record<string, readonly Slot[]> = { Berta: [{ from: 0, where: "home", doing: "repair" }] }
  return { room, storage, documents, routines, use, stored }
}

it("checks the declared shared-table job without editing documents or treating it as designed", () => {
  const f = fixture()
  const before = JSON.stringify([...f.documents])
  expect(auditRoomWorkUses(f.documents, f.routines)).toEqual([])
  expect(JSON.stringify([...f.documents])).toBe(before)
  f.room.design_gate = "通過"
  expect(auditRoomWorkUses(f.documents, f.routines)).toContain("room: Work use is still proposed")
})

it.each(["furniture", "seat_symbol"] as const)("rejects a missing %s", (field) => {
  const f = fixture()
  f.use[field] = "missing"
  expect(auditRoomWorkUses(f.documents, f.routines)).toContain("room: Work use has no matching furniture and seat")
})

it.each(["key", "doing"] as const)("rejects a stale routine %s", (field) => {
  const f = fixture()
  f.use.routine_source[field] = "missing"
  expect(auditRoomWorkUses(f.documents, f.routines)).toContain("room: Work use has no matching routine activity")
})

it("rejects a storage compartment which does not exist", () => {
  const f = fixture()
  f.use.kit.storage_compartment = "missing"
  expect(auditRoomWorkUses(f.documents, f.routines)).toContain("room: Work use has no matching household storage compartment")
})

it("rejects private storage owned by someone else", () => {
  const f = fixture()
  if (f.storage.furniture) f.storage.furniture[0].owner = "Other"
  expect(auditRoomWorkUses(f.documents, f.routines)).toContain("room: Work kit storage belongs to another resident")
})

it.each(["owner", "proposed_box_maker", "proposed_needle_maker"] as const)("rejects an invalid kit %s", (field) => {
  const f = fixture()
  f.use.kit[field] = "missing"
  expect(auditRoomWorkUses(f.documents, f.routines)).toContain("room: Work kit has invalid ownership or makers")
})

it("does not accept an uncompleted proposal with no pending work", () => {
  const f = fixture()
  f.use.pending = []
  expect(auditRoomWorkUses(f.documents, f.routines)).toContain("room: invalid room work uses")
})

it("rejects storage declared in a different household", () => {
  const f = fixture()
  f.storage.building = "other"
  expect(auditRoomWorkUses(f.documents, f.routines)).toContain("room: Work use has no matching household storage compartment")
})

it("requires the containing building and declared occupants", () => {
  const f = fixture()
  f.documents.delete("home")
  expect(auditRoomWorkUses(f.documents, f.routines)).toContain("room: Work use has no containing building")
  f.room.occupants = []
  expect(auditRoomWorkUses(f.documents, f.routines)).toContain("room: Work use has no resident occupant")
})

it("requires dependency gates for the resident, storage and makers", () => {
  const f = fixture()
  f.room.design_dependencies = ["resident-b", "storage"]
  expect(auditRoomWorkUses(f.documents, f.routines)).toContain("room: Work use has missing design dependencies")
})

it("validates work-use structure in the document parser too", () => {
  const f = fixture()
  expect(() => assertSettingShape({ kind: "rooms", work_uses: [f.use] })).not.toThrow()
  f.use.kit.storage_compartment = ""
  expect(() => assertSettingShape({ kind: "rooms", work_uses: [f.use] })).toThrow("work_uses")
})

it("does not interpret inherited object properties as a resident routine", () => {
  const f = fixture()
  const resident = f.documents.get("resident-b")
  if (resident) resident.title = "toString"
  if (f.storage.furniture) f.storage.furniture[0].owner = "toString"
  f.room.occupants = ["toString"]
  f.use.routine_source.key = "toString"
  expect(auditRoomWorkUses(f.documents, f.routines)).toContain("room: Work use has no matching routine activity")
})

it("does not complete a work use without a dimensioned kit box", () => {
  const f = fixture()
  f.use.status = "designed"
  f.use.pending = []
  expect(auditRoomWorkUses(f.documents, f.routines)).toContain("room: Work kit has no dimensioned box")
})

it("includes closed-box packing in the room audit", () => {
  const f = fixture()
  const box = {
    storage_item: "kit",
    clearance_m: 0,
    contents: [{ id: "tool", name: "Tool", owner: "resident-b", makers: ["maker"], source: "test", origin_m: [0, 0, 0], size_m: [0.001, 0.001, 0.001] }],
  }
  f.stored.wall_thickness_m = 0.16
  f.room.work_uses = [{ ...f.use, kit: { ...f.use.kit, box } }]
  expect(auditRoomWorkUses(f.documents, f.routines)).toContain("room: Invalid storage box wall or lid")
})

it("requires dependency gates for additional parcel makers", () => {
  const f = fixture()
  f.documents.set("second-maker", document("second-maker", "residents"))
  const box = {
    storage_item: "kit",
    clearance_m: 0,
    contents: [{ id: "tool", name: "Tool", owner: "resident-b", makers: ["maker", "second-maker"], source: "test", origin_m: [0, 0, 0], size_m: [0.01, 0.01, 0.01] }],
  }
  f.room.work_uses = [{ ...f.use, kit: { ...f.use.kit, box } }]
  expect(auditRoomWorkUses(f.documents, f.routines)).toContain("room: Work use has missing design dependencies")
})

it("does not accept a tabletop setup without its referenced kit", () => {
  const f = fixture()
  f.room.work_uses = [{ ...f.use, table_setup: { box_origin_m: [0, 0], lid_origin_m: [0, 0.3], clearance_m: 0.01 } }]
  expect(auditRoomWorkUses(f.documents, f.routines)).toContain("room: Work tabletop setup has no referenced box")
})

it("does not complete a kit job without tabletop placement", () => {
  const f = fixture()
  f.room.work_uses = [
    {
      ...f.use,
      status: "designed",
      pending: [],
      kit: {
        ...f.use.kit,
        box: {
          storage_item: "kit",
          clearance_m: 0.01,
          contents: [{ id: "tool", name: "Tool", owner: "resident-b", makers: ["maker"], source: "test", origin_m: [0, 0, 0], size_m: [0.01, 0.01, 0.01] }],
        },
      },
    },
  ]
  expect(auditRoomWorkUses(f.documents, f.routines)).toContain("room: Work use has no tabletop setup")
})

it("includes tabletop containment in the room audit", () => {
  const f = fixture()
  f.room.grid = { cell_m: 0.5, rows: ["...."] }
  const table = f.room.furniture?.find((piece) => piece.symbol === "T")
  if (!table) throw new Error("Missing fixture table")
  table.rect = [0, 0, 2, 3]
  table.runtime_kind = "table"
  table.work_surface = { height_m: 0.74, thickness_m: 0.035, leg_width_m: 0.06, leg_inset_m: 0.1, knee_clearance_m: 0.16 }
  f.room.work_uses = [
    {
      ...f.use,
      table_setup: { box_origin_m: [0.62, 0.7], lid_origin_m: [0.99, 0.98], clearance_m: 0.01 },
      kit: {
        ...f.use.kit,
        box: {
          storage_item: "kit",
          clearance_m: 0.01,
          contents: [{ id: "tool", name: "Tool", owner: "resident-b", makers: ["maker"], source: "test", origin_m: [0, 0, 0], size_m: [0.01, 0.01, 0.01] }],
        },
      },
    },
  ]
  expect(auditRoomWorkUses(f.documents, f.routines)).toContain("room: Layout object lid leaves its container")
})
