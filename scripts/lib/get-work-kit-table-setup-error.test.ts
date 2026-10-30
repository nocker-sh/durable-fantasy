import { expect, it } from "vitest"
import { getWorkKitTableSetupError } from "#/scripts/lib/get-work-kit-table-setup-error"
import { workKitTableSetupSchema } from "#/scripts/lib/work-kit-table-setup-schema"

function fixture() {
  return {
    setup: workKitTableSetupSchema.parse({ box_origin_m: [0.62, 0.7], lid_origin_m: [0.62, 0.98], clearance_m: 0.01 }),
    dimensions: { width: 0.24, height: 0.08, depth: 0.16, wall: 0.008, lid: 0.008 },
    table: {
      symbol: "T",
      name: "Table",
      owner: "household",
      source: "test",
      rect: [0, 0, 2, 3],
      access: [[2, 0]],
      runtime_kind: "table",
      work_surface: { height_m: 0.74, thickness_m: 0.035, leg_width_m: 0.06, leg_inset_m: 0.1, knee_clearance_m: 0.16 },
    },
    cell: 0.5,
  }
}

it("supports separate box and lid footprints on the measured table without changing their plan", () => {
  const f = fixture()
  const before = JSON.stringify(f)
  expect(getWorkKitTableSetupError(f)).toBeNull()
  expect(JSON.stringify(f)).toBe(before)
})

it.each([
  ["box_origin_m", 0, 0.8],
  ["box_origin_m", 1, 1.4],
  ["lid_origin_m", 0, 0.8],
  ["lid_origin_m", 1, 1.4],
] as const)("rejects overhang for %s on axis %s", (field, axis, origin) => {
  const f = fixture()
  f.setup[field][axis] = origin
  expect(getWorkKitTableSetupError(f)?.message).toContain("leaves its container")
})

it("rejects overlapping footprints or insufficient separation", () => {
  const f = fixture()
  f.setup.box_origin_m = [0, 0.5]
  f.setup.lid_origin_m = [0, 0.5]
  expect(getWorkKitTableSetupError(f)?.message).toContain("overlap")
  f.setup.lid_origin_m = [0.245, 0.5]
  expect(getWorkKitTableSetupError(f)?.message).toContain("clearance")
})

it("requires a physical table top and valid box boards", () => {
  const f = fixture()
  expect(getWorkKitTableSetupError({ ...f, table: { ...f.table, runtime_kind: "shelf" } })).toBeInstanceOf(Error)
  expect(getWorkKitTableSetupError({ ...f, cell: 0 })).toBeInstanceOf(Error)
  expect(getWorkKitTableSetupError({ ...f, dimensions: { ...f.dimensions, lid: 0.1 } })).toBeInstanceOf(Error)
  f.table.work_surface.thickness_m = f.table.work_surface.height_m
  expect(getWorkKitTableSetupError(f)).toBeInstanceOf(Error)
})
