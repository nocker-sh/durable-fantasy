import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Placed } from "../../world/town/floorplan/types"

export function compileRoomDetails(building: SettingDocument, rooms: readonly SettingDocument[]): Placed[] {
  const result: Placed[] = []
  for (const room of rooms)
    if (room.building === building.id && room.grid) {
      const oxState = room.origin as number[],
        ox = oxState[0],
        oz = oxState[1],
        k = room.grid.cell_m
      for (const detail of (room.details ?? []) as {
        name: string
        on: Placed["on"]
        support?: string
        rect_m: [number, number, number, number]
        wall_mount?: { side: "n" | "e" | "s" | "w"; bottom_m: number; height_m: number }
      }[]) {
        const support = room.furniture?.find((f) => f.symbol === detail.support)
        if (detail.support && !support) throw new Error("Detail has no matching support")
        const xState = detail.rect_m,
          x = xState[0],
          z = xState[1],
          w = xState[2],
          d = xState[3]
        if (
          ![x, z, w, d].every(Number.isFinite) ||
          x < 0 ||
          z < 0 ||
          w <= 0 ||
          d <= 0 ||
          (support ? x + w > support.rect[2] * k || z + d > support.rect[3] * k : x + w > room.grid.rows[0].length * k || z + d > room.grid.rows.length * k)
        )
          throw new Error("Detail extends beyond its room or support")
        const x0 = (ox + (support?.rect[0] ?? 0)) * k + x,
          z0 = (oz + (support?.rect[1] ?? 0)) * k + z
        result.push({
          name: detail.name,
          on: detail.on,
          wallMount: detail.wall_mount ? { side: detail.wall_mount.side, bottom: detail.wall_mount.bottom_m, height: detail.wall_mount.height_m } : undefined,
          floor: Number(room.floor),
          solid: false,
          wall: detail.on === "壁",
          x0,
          z0,
          x1: x0 + w,
          z1: z0 + d,
        })
      }
    }
  return result
}
