import type { DoorSwing } from "#/scripts/lib/door-swing"
import { auditDoorOperation } from "#/scripts/lib/audit-door-operation"
import { operatorRectDistance } from "#/scripts/lib/operator-rect-distance"
import type { DoorOperation } from "#/scripts/lib/door-operation"
import { doorPanelRect } from "#/scripts/lib/door-panel-rect"
import { rectInDoorFrame } from "#/scripts/lib/rect-in-door-frame"
import { solidLeafHitsBox } from "./solid-door"
import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
export type PairedDoorSequence = { first: "start" | "end"; start: DoorOperation; end: DoorOperation; transfer_points_m: number[][] }
function operatorPoint(swing: DoorSwing, operation: DoorOperation, end: boolean): number[] {
  const inward = swing.open_tip.map((n, i) => (n - swing.hinge[i]) / swing.radius)
  const closed = inward[0] === 0 ? [swing.bounds[2] > swing.hinge[0] ? 1 : -1, 0] : [0, swing.bounds[3] > swing.hinge[1] ? 1 : -1]
  const angle = ((end ? operation.end_deg : operation.start_deg) * Math.PI) / 180
  return swing.hinge.map((n, i) => n + operation.orbit_radius_m * (closed[i] * Math.cos(angle) + inward[i] * Math.sin(angle)))
}
/** Open one leaf, walk between handles with that leaf held open, then open the other. */
type Props = {
  swings: DoorSwing[]
  sequence: PairedDoorSequence
  rows: string[]
  scale: number
}
export function auditPairedDoorOperation(props: Props): string[] {
  const swings = props.swings
  const sequence = props.sequence
  const rows = props.rows
  const scale = props.scale

  if (swings.length !== 2 || swings.some((swing) => swing.thickness_m === undefined)) return ["paired operation needs two designed panels"]
  const firstIndex = sequence.first === "start" ? 0 : 1,
    secondIndex = 1 - firstIndex
  const first = swings[firstIndex],
    second = swings[secondIndex],
    operations = [sequence.start, sequence.end],
    errors: string[] = []
  if (Math.abs(sequence.start.body_radius_m - sequence.end.body_radius_m) > 1e-9) errors.push("paired operation changes the operator's body size")
  for (const index of [firstIndex, secondIndex]) {
    const moving = swings[index],
      other = swings[1 - index],
      otherRect = doorPanelRect(other, index === secondIndex)
    errors.push(...auditDoorOperation({ swing: moving, operation: operations[index], rows: rows, scale: scale }).map((error) => `${index === 0 ? "start" : "end"} leaf: ${error}`))
    if (solidLeafHitsBox(moving.radius, moving.thickness_m!, rectInDoorFrame(moving, otherRect))) errors.push("moving panel hits the stationary panel")
    if (operatorRectDistance(moving, operations[index], otherRect) < operations[index].body_radius_m - 1e-9) errors.push("operator path hits the stationary panel")
  }
  const points = sequence.transfer_points_m,
    from = operatorPoint(first, operations[firstIndex], true),
    to = operatorPoint(second, operations[secondIndex], false)
  if (points.length < 2 || [0, 1].some((axis) => Math.abs(points[0][axis] - from[axis]) > 1e-8 || Math.abs(points[points.length - 1][axis] - to[axis]) > 1e-8))
    return [...errors, "handle transfer does not join the operating arcs"]
  const obstacles: number[][] = [doorPanelRect(first, true), doorPanelRect(second, false)]
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) if (![".", "D"].includes(rows[y][x])) obstacles.push([x * scale, y * scale, scale, scale])
  const radius = operations[firstIndex].body_radius_m,
    width = rows[0].length * scale,
    depth = rows.length * scale
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i]
    if (
      [a, b].some((entry) => {
        const x = entry[0]
        const y = entry[1]
        return x < radius - 1e-9 || y < radius - 1e-9 || x > width - radius + 1e-9 || y > depth - radius + 1e-9
      })
    )
      errors.push("handle transfer leaves the room drawing")
    for (const entry2 of obstacles) {
      const x = entry2[0]
      const y = entry2[1]
      const w = entry2[2]
      const h = entry2[3]
      if (segmentRectDistance([x, y, x + w, y + h], a, b) < radius - 1e-9) errors.push("handle transfer hits an obstacle")
    }
  }
  return [...new Set(errors)]
}
