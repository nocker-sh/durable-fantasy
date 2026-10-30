import type { DoorSwing } from "#/scripts/lib/door-swing"

/** Both proposed north-hinged gates open east; local coordinates are closed-axis distance followed by opening-axis distance. */
export function getStockLockBodyPoint(swing: Readonly<DoorSwing>, point: readonly [number, number]): [number, number] {
  return [swing.hinge[0] + point[1], swing.hinge[1] + point[0]]
}
