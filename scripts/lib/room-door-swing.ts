import { doorMovingThickness } from "#/world/town/door-moving-thickness"
import { doorHandleAlong } from "#/world/town/door-handle-along"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Leaf, DoorSwing } from "#/scripts/lib/door-swing"

export function roomDoorSwing(document: SettingDocument, leaf: Leaf): DoorSwing | undefined {
  if (!document.grid) return undefined
  const rowsSource = document.grid,
    rows = rowsSource.rows,
    scale = rowsSource.cell_m,
    xState = leaf.door,
    x = xState[0],
    y = xState[1]
  const connection = (document.connections as { kind?: string; door?: number[]; width_cells?: number }[] | undefined)?.find(
    (c) => (c.kind ?? "door") === "door" && c.door?.[0] === x && c.door?.[1] === y,
  )
  if (!connection) return undefined
  const horizontal = y === 0 || y === rows.length - 1,
    width = connection.width_cells ?? 1
  if (!horizontal && x !== 0 && x !== rows[0].length - 1) return undefined
  const inward = horizontal ? [0, y === 0 ? 1 : -1] : [x === 0 ? 1 : -1, 0],
    closed = horizontal ? [1, 0] : [0, 1]
  const hinge = horizontal ? [x * scale, (y === 0 ? 1 : y) * scale] : [(x === 0 ? 1 : x) * scale, y * scale],
    inset = leaf.frame_inset_m ?? 0,
    aperture = width * scale - 2 * inset,
    radius = (aperture - (leaf.paired ? (leaf.meeting_gap_m ?? 0) : 0)) / (leaf.paired ? 2 : 1)
  const depth = leaf.wall_depth_cells ?? 1
  if (radius <= 0 || !Number.isSafeInteger(depth) || depth < 1 || depth >= (horizontal ? rows.length : rows[0].length)) return undefined
  // A recessed leaf cannot jump across a wall, furniture, or a missing floor cell.
  for (const step = { value: 0 }; step.value < depth; step.value++)
    for (const k = { value: 0 }; k.value < width; k.value++) {
      const cx = x + closed[0] * k.value + inward[0] * step.value,
        cy = y + closed[1] * k.value + inward[1] * step.value
      if (![".", "D"].includes(rows[cy]?.[cx])) return undefined
    }
  for (const i = { value: 0 }; i.value < 2; i.value++) hinge[i.value] += inward[i.value] * (depth - 1) * scale
  for (const i = { value: 0 }; i.value < 2; i.value++) hinge[i.value] += closed[i.value] * inset
  if (leaf.hinge === "end")
    for (const i = { value: 0 }; i.value < 2; i.value++) {
      hinge[i.value] += closed[i.value] * aperture
      closed[i.value] *= -1
    }
  const grip = (() => {
    try {
      return doorHandleAlong(radius, leaf.fittings?.handle_along_m)
    } catch {
      return undefined
    }
  })()
  if (grip === undefined) return undefined
  const tip = hinge.map((v, i) => v + closed[i] * radius),
    open_tip = hinge.map((v, i) => v + inward[i] * radius)
  return {
    hinge,
    radius,
    open_tip,
    handle_along_m: grip,
    thickness_m: leaf.thickness_m === undefined ? undefined : doorMovingThickness(leaf.thickness_m, leaf.fittings),
    bounds: [Math.min(hinge[0], tip[0], open_tip[0]), Math.min(hinge[1], tip[1], open_tip[1]), Math.max(hinge[0], tip[0], open_tip[0]), Math.max(hinge[1], tip[1], open_tip[1])],
  }
}
