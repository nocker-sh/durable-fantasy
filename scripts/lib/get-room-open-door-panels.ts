import { z } from "zod"
import { doorLeafGeometrySchema } from "#/scripts/lib/door-leaf-geometry-schema"
import { roomDoorSwings } from "#/scripts/lib/room-door-swings"
import { doorPanelRect } from "#/scripts/lib/door-panel-rect"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Keep the complete open panel, including hardware on both faces, as an obstacle instead of deleting the doorway's leaf. */
export function getRoomOpenDoorPanels(room: SettingDocument) {
  const leaves = z.array(doorLeafGeometrySchema).safeParse(room.door_leaves ?? []),
    boxes: (readonly [number, number, number, number])[] = []
  if (!leaves.success) return new Error("Invalid open door panel geometry")
  for (const leaf of leaves.data) {
    const swings = roomDoorSwings(room, leaf)
    if (!swings.length) return new Error("Open door panel has no matching doorway")
    for (const swing of swings) {
      const rect = doorPanelRect(swing, true)
      if (!rect.every(Number.isFinite)) return new Error("Open door panel is unbounded")
      boxes.push([rect[0], rect[1], rect[0] + rect[2], rect[1] + rect[3]])
    }
  }

  return boxes
}
