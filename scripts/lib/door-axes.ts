import type { DoorSwing } from "#/scripts/lib/door-swing"

/** Share the same closed and inward axes for the panel, body and furniture checks. */
export function doorAxes(swing: DoorSwing): { inward: [number, number]; closed: [number, number] } {
  const inward: [number, number] = [(swing.open_tip[0] - swing.hinge[0]) / swing.radius, (swing.open_tip[1] - swing.hinge[1]) / swing.radius]
  const closed: [number, number] = inward[0] === 0 ? [swing.bounds[2] > swing.hinge[0] ? 1 : -1, 0] : [0, swing.bounds[3] > swing.hinge[1] ? 1 : -1]
  return { inward, closed }
}
