import type { DoorSwing } from "#/scripts/lib/door-swing"
import { doorAxes } from "#/scripts/lib/door-axes"

/** Occupied rectangle of a cardinal leaf at rest; dimensions remain in metres. */
export function doorPanelRect(swing: DoorSwing, open: boolean): [number, number, number, number] {
  const inwardSource = doorAxes(swing),
    inward = inwardSource.inward,
    closed = inwardSource.closed
  const direction = open ? inward : closed,
    tip = swing.hinge.map((n, i) => n + direction[i] * swing.radius),
    half = (swing.thickness_m ?? 0) / 2
  const horizontal = direction[1] === 0
  return [
    Math.min(swing.hinge[0], tip[0]) - (horizontal ? 0 : half),
    Math.min(swing.hinge[1], tip[1]) - (horizontal ? half : 0),
    Math.abs(tip[0] - swing.hinge[0]) + (horizontal ? 0 : 2 * half),
    Math.abs(tip[1] - swing.hinge[1]) + (horizontal ? 2 * half : 0),
  ]
}
