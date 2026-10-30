import { roomDoorSwings } from "#/scripts/lib/room-door-swings"
import { doorPanelRect } from "#/scripts/lib/door-panel-rect"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Walls and fully open door panels in room-local metres, shared by planar and spatial checks. */
export function roomEnvelopeObstacles(room: SettingDocument): readonly (readonly [number, number, number, number])[] {
  if (!room.grid) return []
  const k = room.grid.cell_m,
    boxes: [number, number, number, number][] = []
  room.grid.rows.forEach((row, z) =>
    [...row].forEach((s, x) => {
      if (s === "#") boxes.push([x * k, z * k, (x + 1) * k, (z + 1) * k])
    }),
  )
  for (const leaf of (room.door_leaves ?? []) as Parameters<typeof roomDoorSwings>[1][]) {
    const swings = roomDoorSwings(room, leaf)
    if (swings.length !== (leaf.paired ? 2 : 1)) throw new Error("Room has an invalid door leaf")
    for (const swing of swings) {
      const xState = doorPanelRect(swing, true),
        x = xState[0],
        z = xState[1],
        w = xState[2],
        d = xState[3]
      boxes.push([x, z, x + w, z + d])
    }
  }
  return boxes
}
