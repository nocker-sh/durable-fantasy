import type { DoorSwing } from "#/scripts/lib/door-swing"
import { doorAxes } from "#/scripts/lib/door-axes"

/** Cardinal door axes preserve an axis-aligned rectangle in this coordinate frame. */
export function rectInDoorFrame(swing: DoorSwing, entry: number[]): [number, number, number, number] {
  const x = entry[0]
  const y = entry[1]
  const w = entry[2]
  const h = entry[3]

  const inwardSource = doorAxes(swing),
    inward = inwardSource.inward,
    closed = inwardSource.closed
  const points = [
    [x, y],
    [x + w, y],
    [x, y + h],
    [x + w, y + h],
  ].map((entry2) => {
    const px = entry2[0]
    const py = entry2[1]

    const dx = px - swing.hinge[0],
      dy = py - swing.hinge[1]
    return [dx * closed[0] + dy * closed[1], dx * inward[0] + dy * inward[1]]
  })
  return [
    Math.min(
      ...points.map((entry3) => {
        const u = entry3[0]
        return u
      }),
    ),
    Math.min(
      ...points.map((entry4) => {
        const v = entry4[1]
        return v
      }),
    ),
    Math.max(
      ...points.map((entry5) => {
        const u = entry5[0]
        return u
      }),
    ),
    Math.max(
      ...points.map((entry6) => {
        const v = entry6[1]
        return v
      }),
    ),
  ]
}
