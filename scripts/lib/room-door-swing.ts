import { getDoorSwingSource } from "#/scripts/lib/get-door-swing-source"
import { getDoorSwingFrame } from "#/scripts/lib/get-door-swing-frame"
import { doorMovingThickness } from "#/world/town/door-moving-thickness"
import { doorHandleAlong } from "#/world/town/door-handle-along"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Leaf, DoorSwing } from "#/scripts/lib/door-swing"

export function roomDoorSwing(document: SettingDocument, leaf: Leaf): DoorSwing | undefined {
  const source = getDoorSwingSource(document, leaf)
  if (!source) return undefined
  const frame = getDoorSwingFrame(source, leaf)
  if (!frame) return undefined
  const hinge = frame.hinge,
    radius = frame.radius,
    closed = frame.closed,
    inward = frame.inward
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
