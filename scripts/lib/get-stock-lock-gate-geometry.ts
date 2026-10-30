import type { z } from "zod"
import type { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import type { DoorSwing } from "#/scripts/lib/door-swing"
import { doorMovingThickness } from "#/world/town/door-moving-thickness"
import { doorHandleAlong } from "#/world/town/door-handle-along"
import { getDoorFrameBoxes } from "#/scripts/lib/get-door-frame-boxes"
import { doorPanelRect } from "#/scripts/lib/door-panel-rect"
type Plan = z.infer<typeof stockLockSchema>

/** Both north hinges turn east; their centre projects beyond the opening's east face so the fitted board can clear its own jamb. */
export function getStockLockGateGeometry(plan: Plan, gate: Plan["gates"][number]) {
  const cell = plan.layout.cell_m,
    leaf = gate.leaf,
    radius = gate.width_cells * cell - 2 * leaf.frame_inset_m,
    thickness = doorMovingThickness(leaf.thickness_m, leaf.fittings)
  if (!Number.isFinite(radius) || radius <= 0) return new Error("Stock gate has no framed aperture")
  const x = (gate.door[0] + 1) * cell + leaf.hinge_projection_m,
    y = gate.door[1] * cell + leaf.frame_inset_m
  if (![x, y, thickness, x + radius, y + radius].every(Number.isFinite)) return new Error("Unbounded stock gate geometry")
  if (leaf.fittings.handle_along_m > radius) return new Error("Stock gate handle is outside its leaf")
  const swing: DoorSwing = {
    hinge: [x, y],
    radius,
    thickness_m: thickness,
    handle_along_m: doorHandleAlong(radius, leaf.fittings.handle_along_m),
    bounds: [x, y, x + radius, y + radius],
    open_tip: [x + radius, y],
  }
  const frames = getDoorFrameBoxes({
    door: gate.door,
    width: gate.width_cells,
    cellM: cell,
    rows: plan.layout.rows.length,
    columns: plan.layout.rows[0].length,
    frameInset: leaf.frame_inset_m,
    wallDepth: 1,
  })
  if (frames instanceof Error) return frames
  const closed = doorPanelRect(swing, false),
    half = thickness / 2,
    reach = Math.hypot(radius, half)
  const bounds: readonly [number, number, number, number] = [x - half, y - half, x + reach, y + reach]
  if (!bounds.every(Number.isFinite)) return new Error("Unbounded stock gate sweep")

  return { id: gate.id, swing, frames, closed: [closed[0], closed[1], closed[0] + closed[2], closed[1] + closed[3]] satisfies readonly [number, number, number, number], bounds }
}
