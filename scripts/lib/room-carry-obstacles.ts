import type { SettingDocument } from "#/scripts/lib/setting-document"
import { roomEnvelopeObstacles } from "#/scripts/lib/room-envelope-obstacles"

/** Unmodelled furniture reserves its full footprint; specialised checks supply its physical pieces. */
export function roomCarryObstacles(room: SettingDocument): readonly (readonly [number, number, number, number])[] {
  const boxes = [...roomEnvelopeObstacles(room)]
  if (!room.grid) return boxes
  const k = room.grid.cell_m
  for (const f of room.furniture ?? []) {
    const xState = f.rect,
      x = xState[0],
      z = xState[1],
      w = xState[2],
      d = xState[3]
    boxes.push([x * k, z * k, (x + w) * k, (z + d) * k])
  }
  return boxes
}
