import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Endpoint } from "#/scripts/lib/outdoor-access"
type OutdoorSite = { room: SettingDocument; map: string; origin: number[]; width: number; depth: number; rotation: number }
export function outdoorSite(owner: SettingDocument, endpoint: Endpoint, documents: ReadonlyMap<string, SettingDocument>): OutdoorSite | undefined {
  if (owner.kind === "buildings") {
    const room = documents.get(endpoint.room ?? "")
    const layout = owner.layout as { cell_m: number; width: number; depth: number } | undefined,
      site = owner.site_plan as { origin: number[]; rotation_quarters: number } | undefined
    if (!layout || !site || room?.kind !== "rooms" || room.building !== owner.id || !(owner.rooms as string[] | undefined)?.includes(room.id) || room.floor !== 0 || !Array.isArray(room.origin))
      return undefined
    return { room, map: String(owner.map), origin: site.origin, width: layout.width * layout.cell_m, depth: layout.depth * layout.cell_m, rotation: site.rotation_quarters }
  } else if (owner.kind === "facilities") {
    const site = owner.site as { map: string; occupied_rect_tiles?: number[]; rotation_quarters?: number } | undefined
    if (endpoint.room || !owner.grid || !site?.occupied_rect_tiles) return undefined
    const room = { ...owner, origin: [0, 0] }
    return {
      room,
      map: site.map,
      origin: site.occupied_rect_tiles.slice(0, 2),
      width: owner.grid.rows[0].length * owner.grid.cell_m,
      depth: owner.grid.rows.length * owner.grid.cell_m,
      rotation: site.rotation_quarters ?? 0,
    }
  } else return undefined
}
