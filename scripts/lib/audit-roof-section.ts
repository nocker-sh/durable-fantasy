import type { SettingDocument } from "#/scripts/lib/setting-document"
import { MIN_STANDING_HEADROOM_M } from "#/scripts/lib/spatial-rules"
import type { Roof } from "#/scripts/lib/roof-section"
import { roofHeightAt } from "#/scripts/lib/roof-height-at"

export function auditRoofSection(building: SettingDocument, documents: ReadonlyMap<string, SettingDocument>): string[] {
  const roof = building.roof_section as Roof | undefined
  if (!roof) return building.design_gate === "通過" ? ["Building has no roof section"] : []
  const layout = building.layout as { width: number; depth: number; cell_m: number } | undefined
  if (!layout) return ["Roof has no dimensioned building plan"]
  if (roof.ridge_underside_m < roof.eave_underside_m) return ["Roof ridge lies below its eaves"]
  const errors: string[] = [],
    levels = building.floor_levels as { floor: number; elevation_m: number; ceiling_elevation_m?: number | null }[] | undefined
  const minimum = (rect: number[]) =>
    Math.min(
      ...[
        [rect[0], rect[1]],
        [rect[0] + rect[2], rect[1]],
        [rect[0], rect[1] + rect[3]],
        [rect[0] + rect[2], rect[1] + rect[3]],
      ].map((entry) => {
        const x = entry[0]
        const y = entry[1]
        return roofHeightAt({ roof: roof, width_m: layout.width * layout.cell_m, depth_m: layout.depth * layout.cell_m, x_m: x, y_m: y })
      }),
    )
  for (const id of (building.rooms ?? []) as string[]) {
    const room = documents.get(id),
      level = levels?.find((l) => l.floor === room?.floor)
    if (!room?.grid || !Array.isArray(room.origin) || !level) {
      errors.push(`${id}: roof clearance has no room elevation or grid`)
      continue
    }
    const origin = room.origin,
      scale = room.grid.cell_m
    const rectMetres = (entry2: number[]) => {
      const x = entry2[0]
      const y = entry2[1]
      const w = entry2[2]
      const h = entry2[3]
      return [(Number(origin[0]) + x) * scale, (Number(origin[1]) + y) * scale, w * scale, h * scale]
    }
    for (const furniture of room.furniture ?? [])
      for (const space of furniture.use_space ?? [])
        if (minimum(rectMetres(space.rect)) - level.elevation_m + 1e-9 < MIN_STANDING_HEADROOM_M) errors.push(`${id}/${furniture.symbol}: roof is too low over operating space`)
    if (level.ceiling_elevation_m !== null && level.ceiling_elevation_m !== undefined)
      for (const c of (room.connections ?? []) as { kind?: string; furniture?: string }[]) {
        if (c.kind !== "stair") continue
        const stair = room.furniture?.find((f) => f.symbol === c.furniture)
        if (stair && minimum(rectMetres(stair.rect)) + 1e-9 < level.ceiling_elevation_m) errors.push(`${id}: roof intrudes into stair ceiling envelope`)
      }
  }
  return [...new Set(errors)]
}
