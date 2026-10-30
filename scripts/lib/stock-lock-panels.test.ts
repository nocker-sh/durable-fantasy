import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { getStockLockPanelError } from "#/scripts/lib/get-stock-lock-panel-error"
import { getStockLockLayoutError } from "#/scripts/lib/get-stock-lock-layout-error"
import { getStockLockGateGeometry } from "#/scripts/lib/get-stock-lock-gate-geometry"
import { doorPanelRect } from "#/scripts/lib/door-panel-rect"

function fixture() {
  const facility = readSetting(readFileSync(".docs/settings/facilities/facility-square-pasture.md", "utf8"))

  return stockLockSchema.parse(facility.stock_lock)
}

it("fits the authored fitted leaves throughout their quarter-turns without consuming either frame or the waiting floor", () => {
  const plan = fixture(),
    before = JSON.stringify(plan)
  expect(getStockLockLayoutError(plan)).toBeNull()
  expect(getStockLockPanelError(plan)).toBeNull()
  expect(JSON.stringify(plan)).toBe(before)
})

it("detects a hinge corner cutting its own jamb even with a thin board clear of the boundary fence", () => {
  const plan = fixture(),
    outer = plan.gates.find((gate) => gate.id === "outer")
  if (!outer) throw new Error("Missing outer gate")
  outer.leaf = { ...outer.leaf, hinge_projection_m: 0, thickness_m: 0.02, fittings: { handle_along_m: 1.4, brace_projection_m: 0.01, handle_projection_m: 0.01 } }
  expect(getStockLockPanelError(plan)?.message).toContain("sweep hits frame")
  outer.leaf.hinge_projection_m = 0.08
  expect(getStockLockPanelError(plan)).toBeNull()
})

it("detects a waiting floor touched only between the closed and fully open poses", () => {
  const plan = fixture()
  plan.zones[0].rect = [6, 13, 5, 4]
  plan.layout.rows = plan.layout.rows.map((row, y) =>
    [...row]
      .map((symbol, x) => {
        if (x >= 6 && x < 11 && y >= 13 && y < 17) return "S"
        if (symbol === "S") return "."
        return symbol
      })
      .join(""),
  )
  const outer = getStockLockGateGeometry(plan, plan.gates[0])
  if (outer instanceof Error) throw outer
  const closed = doorPanelRect(outer.swing, false),
    open = doorPanelRect(outer.swing, true)
  expect(closed[0] + closed[2]).toBeLessThan(6 * plan.layout.cell_m)
  expect(open[1] + open[3]).toBeLessThan(13 * plan.layout.cell_m)
  expect(getStockLockLayoutError(plan)).toBeNull()
  expect(getStockLockPanelError(plan)?.message).toContain("sweep hits waiting floor")
})

it("includes projecting hardware rather than testing just the board thickness", () => {
  const plan = fixture()
  plan.gates[0].leaf.fittings.handle_projection_m = 0.12
  expect(getStockLockPanelError(plan)).toBeInstanceOf(Error)
  plan.gates[0].leaf.fittings.handle_projection_m = 0.04
  expect(getStockLockPanelError(plan)).toBeNull()
})

it("does not remove the other gate's closed panel to clear an enlarged sweep", () => {
  const plan = fixture(),
    outer = plan.gates.find((gate) => gate.id === "outer"),
    inner = plan.gates.find((gate) => gate.id === "inner")
  if (!outer || !inner) throw new Error("Missing gates")
  outer.leaf = { ...outer.leaf, hinge_projection_m: 3.1, thickness_m: 0.02, fittings: { handle_along_m: 1.4, brace_projection_m: 0, handle_projection_m: 0 } }
  inner.leaf.frame_inset_m = 0.02
  expect(getStockLockPanelError(plan)?.message).toContain("sweep hits closed peer")
})

it("rejects a detached or short pasture-side reservation and a handle beyond the leaf", () => {
  const plan = fixture()
  plan.pasture_side.rect_m[0] = 4.5
  expect(getStockLockPanelError(plan)?.message).toContain("detached")
  plan.pasture_side.rect_m = [4.4, 0, 1, 4.4]
  expect(getStockLockPanelError(plan)?.message).toContain("leaves its reserved floor")
  plan.pasture_side.rect_m = [4.4, 0, 3, 4.4]
  plan.gates[0].leaf.fittings.handle_along_m = 2
  expect(getStockLockPanelError(plan)?.message).toContain("handle is outside")
})
