import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { auditPersonalStoragePacking } from "#/scripts/lib/audit-personal-storage-packing"

function fixture(number = 3) {
  const owner = number === 3 ? "ヴィルヘルム" : "ゾフィー"
  const paths = ["buildings/building-h1", `rooms/room-h1-${number}`, `residents/resident-${owner}`, "residents/resident-ゴットフリート", "residents/resident-ヨーゼフ"]
  const documents = new Map(
    paths.map((path) => {
      const document = readSetting(readFileSync(`.docs/settings/${path}.md`, "utf8"))
      return [document.id, document]
    }),
  )
  const room = documents.get(`room-h1-${number}`)
  if (!room) throw new Error("Missing bedroom fixture")
  const slots = personalStorageSchema.parse(room.personal_storage),
    plan = slots[0].packing
  if (!plan) throw new Error("Missing packing fixture")
  room.personal_storage = slots
  return { room, slots, plan, documents }
}

it("fits each source owner's folded belongings in their separate physical chest", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      before = JSON.stringify(source.room)
    expect(auditPersonalStoragePacking(source.room, source.documents)).toEqual([])
    expect(JSON.stringify(source.room)).toBe(before)
    source.plan.objects[0].size_m[2] = 0.48
    expect(auditPersonalStoragePacking(source.room, source.documents).join()).toContain("leaves its container")
  }
})

it("keeps belongings identities, local suppliers, owner and design scope attached to the box", () => {
  const identities = fixture()
  identities.plan.objects[0].id = "storage-someone-else:clothing"
  expect(auditPersonalStoragePacking(identities.room, identities.documents).join()).toContain("unique belongings")
  const supplier = fixture()
  supplier.plan.maker = "resident-ヨーゼフ"
  expect(auditPersonalStoragePacking(supplier.room, supplier.documents).join()).toContain("local box supplier")
  const owner = fixture()
  owner.slots[0].resident = "resident-ゾフィー"
  expect(auditPersonalStoragePacking(owner.room, owner.documents).join()).toContain("owner")
  const gate = fixture()
  gate.room.design_gate = "通過"
  expect(auditPersonalStoragePacking(gate.room, gate.documents).join()).toContain("opening and retrieval remain unverified")
})

it("rejects malformed plans instead of falling back to an unmeasured assignment", () => {
  const source = fixture()
  source.plan.objects.pop()
  expect(auditPersonalStoragePacking(source.room, source.documents).join()).toContain("Invalid")
  expect(() => readSetting(`---\n${JSON.stringify(source.room)}\n---\n# ${source.room.title}\n\n衣服箱の案。`)).toThrow()
  const legacy = fixture()
  delete legacy.slots[0].packing
  expect(auditPersonalStoragePacking(legacy.room, legacy.documents)).toEqual([])
})

it("rejects overlapping contents, floating parcels and missing physical prerequisites", () => {
  const overlap = fixture()
  overlap.plan.objects[1].position_m = [...overlap.plan.objects[0].position_m]
  expect(auditPersonalStoragePacking(overlap.room, overlap.documents).join()).toContain("overlap")
  const floating = fixture()
  floating.plan.objects[0].position_m[1] = 0.02
  expect(auditPersonalStoragePacking(floating.room, floating.documents).join()).toContain("floor support")
  const repeated = fixture()
  repeated.plan.objects[1].kind = "clothing"
  expect(auditPersonalStoragePacking(repeated.room, repeated.documents).join()).toContain("unique belongings")
  const dependencies = fixture()
  dependencies.room.design_dependencies = []
  expect(auditPersonalStoragePacking(dependencies.room, dependencies.documents).join()).toContain("supplier")
  const footprint = fixture()
  footprint.room.grid = null
  expect(auditPersonalStoragePacking(footprint.room, footprint.documents).join()).toContain("personal box")
})

it("does not count the whole cavity twice for separately named compartments or ignore extra contents", () => {
  const shared = fixture()
  shared.slots.push({ ...shared.slots[0], id: "storage-second", compartment: "別区画" })
  expect(auditPersonalStoragePacking(shared.room, shared.documents).join()).toContain("dedicated physical box")
  const extra = fixture()
  extra.slots[0].contents.push("替えの寝具")
  expect(auditPersonalStoragePacking(extra.room, extra.documents).join()).toContain("belongings category")
})

it("includes the authored lid path and its ceiling prerequisites in the ordinary settings audit", () => {
  const source = fixture(),
    opening = source.plan.opening
  if (!opening) throw new Error("Missing lid fixture")
  opening.rest_center_m = [2, 0, 2]
  opening.rest_support = null
  expect(auditPersonalStoragePacking(source.room, source.documents).join()).toContain("intersects an obstacle")
  const missing = fixture()
  missing.documents.delete("building-h1")
  expect(auditPersonalStoragePacking(missing.room, missing.documents).join()).toContain("room section")
})

it("keeps an unresolved native reach proposal attached to its real owner", () => {
  const source = fixture(),
    reach = source.plan.opening?.reach_review
  if (!reach) throw new Error("Missing authored reach fixture")
  reach.operator = "resident-ゾフィー"
  expect(auditPersonalStoragePacking(source.room, source.documents).join()).toContain("another storage owner")
})

it("rejects another box's handle, unsupported offsets and capacity borrowed from its raised grip", () => {
  const foreign = fixture(),
    handle = foreign.plan.lid_handle
  if (!handle) throw new Error("Missing source handle")
  handle.id = "storage-someone-else:lid-handle"
  expect(auditPersonalStoragePacking(foreign.room, foreign.documents).join()).toContain("another storage box")
  const offset = fixture(),
    displaced = offset.plan.lid_handle
  if (!displaced) throw new Error("Missing source handle")
  displaced.offset_m = [0, -0.5]
  expect(auditPersonalStoragePacking(offset.room, offset.documents).join()).toContain("lid handle")
  const capacity = fixture()
  capacity.plan.objects[0].size_m[1] = 0.5
  expect(auditPersonalStoragePacking(capacity.room, capacity.documents).join()).toContain("leaves its container")
})
