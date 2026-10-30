import type { LampFixture, WindowFixture } from "#/world/town/room-fixtures"
import type { SettingDocument } from "#/scripts/lib/setting-document"

export function compileRoomFixtures(building: SettingDocument, rooms: readonly SettingDocument[]): { windows: WindowFixture[]; lamps: LampFixture[] } {
  const layout = building.layout as { width: number; depth: number; cell_m: number }
  const levels = building.floor_levels as { floor: number; elevation_m: number; ceiling_elevation_m: number }[]
  const windows: WindowFixture[] = [],
    lamps: LampFixture[] = []
  for (const room of rooms) {
    if (room.building !== building.id || (!room.windows && !room.lamps)) continue
    if (!room.grid) continue
    const oxState = room.origin as number[],
      ox = oxState[0],
      oz = oxState[1],
      k = room.grid.cell_m,
      w = room.grid.rows[0].length * k,
      d = room.grid.rows.length * k
    const level = levels.find((l) => l.floor === room.floor)!,
      ceiling = level.ceiling_elevation_m - level.elevation_m
    const openings = (room.windows ?? []) as { id: string; side: WindowFixture["side"]; offset_m: number; width_m: number; sill_m: number; height_m: number; frame_m: number }[]
    for (const opening of openings) {
      const horizontal = opening.side === "n" || opening.side === "s"
      const boundary = opening.side === "n" ? oz === 0 : opening.side === "w" ? ox === 0 : opening.side === "s" ? oz * k + d === layout.depth * k : ox * k + w === layout.width * k
      if (
        ![opening.offset_m, opening.width_m, opening.sill_m, opening.height_m, opening.frame_m].every(Number.isFinite) ||
        !boundary ||
        opening.width_m <= 2 * opening.frame_m ||
        opening.height_m <= 2 * opening.frame_m ||
        opening.sill_m <= 0 ||
        opening.sill_m + opening.height_m > ceiling ||
        opening.offset_m - opening.width_m / 2 < k ||
        opening.offset_m + opening.width_m / 2 > (horizontal ? w : d) - k
      )
        throw new Error(`Window does not fit its exterior wall: ${room.id}/${opening.id}`)
      const along = (horizontal ? ox : oz) * k + opening.offset_m
      const rect =
        opening.side === "n"
          ? { x0: along - opening.width_m / 2, z0: oz * k, x1: along + opening.width_m / 2, z1: oz * k + k }
          : opening.side === "s"
            ? { x0: along - opening.width_m / 2, z0: oz * k + d - k, x1: along + opening.width_m / 2, z1: oz * k + d }
            : opening.side === "w"
              ? { x0: ox * k, z0: along - opening.width_m / 2, x1: ox * k + k, z1: along + opening.width_m / 2 }
              : { x0: ox * k + w - k, z0: along - opening.width_m / 2, x1: ox * k + w, z1: along + opening.width_m / 2 }
      for (const f of room.furniture ?? []) {
        const xState = f.rect,
          x = xState[0],
          z = xState[1],
          fw = xState[2],
          fd = xState[3]
        const alongOverlap = horizontal ? (ox + x) * k < rect.x1 && (ox + x + fw) * k > rect.x0 : (oz + z) * k < rect.z1 && (oz + z + fd) * k > rect.z0
        const throughWall = horizontal ? (oz + z) * k <= rect.z1 && (oz + z + fd) * k >= rect.z0 : (ox + x) * k <= rect.x1 && (ox + x + fw) * k >= rect.x0
        if (alongOverlap && throughWall) throw new Error(`Window intersects furniture: ${room.id}/${f.symbol}`)
      }
      windows.push({
        id: `${room.id}/${opening.id}`,
        floor: Number(room.floor),
        side: opening.side,
        along,
        width: opening.width_m,
        sill: opening.sill_m,
        height: opening.height_m,
        frame: opening.frame_m,
      })
    }
    for (const lamp of (room.lamps ?? []) as { id: string; position_m: number[]; bottom_m: number; top_m: number; diameter_m: number }[]) {
      const xState2 = lamp.position_m,
        x = xState2[0],
        z = xState2[1]
      if (
        ![x, z, lamp.bottom_m, lamp.top_m, lamp.diameter_m].every(Number.isFinite) ||
        lamp.bottom_m < 2 ||
        lamp.top_m - lamp.bottom_m <= lamp.diameter_m * 0.24 ||
        lamp.top_m >= ceiling ||
        lamp.diameter_m <= 0 ||
        x - lamp.diameter_m / 2 < k ||
        x + lamp.diameter_m / 2 > w - k ||
        z - lamp.diameter_m / 2 < k ||
        z + lamp.diameter_m / 2 > d - k
      )
        throw new Error(`Lamp lacks its room or standing headroom: ${room.id}/${lamp.id}`)
      lamps.push({ id: `${room.id}/${lamp.id}`, floor: Number(room.floor), x: ox * k + x, z: oz * k + z, bottom: lamp.bottom_m, top: lamp.top_m, diameter: lamp.diameter_m, ceiling })
    }
  }
  if (new Set(windows.map((w) => w.id)).size !== windows.length || new Set(lamps.map((l) => l.id)).size !== lamps.length) throw new Error("Duplicate room fixture identity")
  return { windows, lamps }
}
