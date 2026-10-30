import type { DoorSwing } from "#/scripts/lib/door-swing"
import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { DoorPush } from "#/scripts/lib/door-push"
import { roomBody } from "#/scripts/lib/door-push/room-body"

/** The body needs supported floor in the doorway and landing as well as a clear moving panel. */
type Props = {
  room: SettingDocument
  swing: DoorSwing
  push: DoorPush
  landing: readonly [number, number, number, number]
}

export function auditDoorPushFloor(props: Props): string[] {
  if (!props.room.grid) return ["push has no room floor"]
  const rowsSource = props.room.grid,
    rows = rowsSource.rows,
    scale = rowsSource.cell_m,
    width = rows[0].length * scale,
    depth = rows.length * scale
  const xs = [...new Set([0, width, props.landing[0], props.landing[2]])].sort((a, b) => a - b),
    ys = [...new Set([0, depth, props.landing[1], props.landing[3]])].sort((a, b) => a - b)
  const blocked: number[][] = []
  for (const j = { value: 0 }; j.value < ys.length - 1; j.value++)
    for (const i = { value: 0 }; i.value < xs.length - 1; i.value++) {
      const x = (xs[i.value] + xs[i.value + 1]) / 2,
        y = (ys[j.value] + ys[j.value + 1]) / 2
      if (!(x >= 0 && x <= width && y >= 0 && y <= depth) && !(x >= props.landing[0] && x <= props.landing[2] && y >= props.landing[1] && y <= props.landing[3]))
        blocked.push([xs[i.value], ys[j.value], xs[i.value + 1] - xs[i.value], ys[j.value + 1] - ys[j.value]])
    }
  for (const j = { value: 0 }; j.value < rows.length; j.value++)
    for (const i = { value: 0 }; i.value < rows[j.value].length; i.value++) if (![".", "D"].includes(rows[j.value][i.value])) blocked.push([i.value * scale, j.value * scale, scale, scale])
  const errors = new Set<string>(),
    bodies = props.push.poses.map((pose) => roomBody(props.swing, pose)),
    radius = props.push.body_radius_m
  for (const body of bodies)
    if (body[0] - radius < xs[0] - 1e-9 || body[0] + radius > xs.at(-1)! + 1e-9 || body[1] - radius < ys[0] - 1e-9 || body[1] + radius > ys.at(-1)! + 1e-9)
      errors.add("push body leaves the supported floor")
  for (const i = { value: 1 }; i.value < bodies.length; i.value++) {
    const a = bodies[i.value - 1],
      b = bodies[i.value]
    if (
      blocked.some((entry) => {
        const x = entry[0]
        const y = entry[1]
        const w = entry[2]
        const h = entry[3]
        return segmentRectDistance([x, y, x + w, y + h], a, b) < radius - 1e-9
      })
    )
      errors.add("push body crosses a wall, furniture or unsupported floor")
    for (const item of props.room.furniture ?? [])
      for (const entry2 of (item.use_space ?? []).entries()) {
        const index = entry2[0]
        const space = entry2[1]

        const xState = space.rect.map((value) => value * scale),
          x = xState[0],
          y = xState[1],
          w = xState[2],
          h = xState[3]
        if (segmentRectDistance([x, y, x + w, y + h], a, b) < radius - 1e-9) errors.add(`push body conflicts with operating space ${item.symbol}/${index}`)
      }
  }
  // Frames are stricter than the rasterized door cells.
  if (props.push.poses.some((pose) => pose.body_m[0] - radius < -1e-9 || pose.body_m[0] + radius > props.swing.radius + 1e-9)) errors.add("push body does not fit between the door frames")
  return [...errors]
}
