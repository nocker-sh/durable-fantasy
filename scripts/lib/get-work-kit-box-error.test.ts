import { expect, it } from "vitest"
import { getWorkKitBoxError } from "#/scripts/lib/get-work-kit-box-error"
import { workKitBoxSchema } from "#/scripts/lib/work-kit-box-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"

const maker: SettingDocument = { id: "maker", kind: "residents", title: "Maker", status: "設計中", source: "test", design_gate: "未通過", issues: [] }
const dimensions = { width: 0.3, height: 0.1, depth: 0.2, wall: 0.01, lid: 0.01 }
const documents = new Map([[maker.id, maker]])
function fixture() {
  return workKitBoxSchema.parse({
    storage_item: "kit",
    clearance_m: 0.005,
    contents: [{ id: "pouch", name: "Pouch", owner: "owner", makers: ["maker"], source: "test", origin_m: [0.01, 0, 0.01], size_m: [0.12, 0.04, 0.08] }],
  })
}

it("fits parcels inside the closed cavity without changing their plan", () => {
  const box = fixture()
  const before = JSON.stringify(box)
  expect(getWorkKitBoxError({ box, dimensions, owner: "owner", documents })).toBeNull()
  expect(JSON.stringify(box)).toBe(before)
})

it.each([0, 1, 2])("rejects an envelope oversized on axis %s", (axis) => {
  const box = fixture()
  box.contents[0].size_m[axis] = 0.5
  expect(getWorkKitBoxError({ box, dimensions, owner: "owner", documents })?.message).toContain("leaves its container")
})

it("rejects overlapping parcels and unsupported stacking", () => {
  const box = fixture()
  box.contents.push({ ...box.contents[0], id: "second" })
  expect(getWorkKitBoxError({ box, dimensions, owner: "owner", documents })?.message).toContain("overlap")
  box.contents.pop()
  box.contents[0].origin_m[1] = 0.01
  expect(getWorkKitBoxError({ box, dimensions, owner: "owner", documents })?.message).toContain("floor support")
})

it("retains wall and lid thickness instead of treating outer volume as storage", () => {
  const box = fixture()
  box.contents[0].size_m[1] = 0.09
  expect(getWorkKitBoxError({ box, dimensions, owner: "owner", documents })?.message).toContain("leaves its container")
  expect(getWorkKitBoxError({ box, dimensions: { ...dimensions, wall: 0.16 }, owner: "owner", documents })?.message).toContain("wall or lid")
})

it("requires every parcel's owner and each maker", () => {
  const box = fixture()
  expect(getWorkKitBoxError({ box, dimensions, owner: "other", documents })?.message).toContain("ownership or makers")
  box.contents[0].makers.push("missing")
  expect(getWorkKitBoxError({ box, dimensions, owner: "owner", documents })?.message).toContain("ownership or makers")
})
