import type { SettingDocument } from "#/scripts/lib/setting-document"
import { MIN_BED_LENGTH_M, MIN_BED_WIDTH_M } from "./spatial-rules"
type GuestPlace = { id: string; label: string; grid_symbol: string | null; luggage_id: string; luggage_symbol: string | null }
/** Guest slots belong to the inn, never to a resident's permanent bed assignment. */
export function auditGuestSleepingPlaces(documents: ReadonlyMap<string, SettingDocument>): string[] {
  const errors: string[] = [],
    ids = new Set<string>()
  for (const room of documents.values())
    if (room.kind === "rooms") {
      for (const place of (room.sleeping_places ?? []) as { id: string }[]) ids.add(place.id)
      for (const storage of (room.personal_storage ?? []) as { id: string }[]) ids.add(storage.id)
    }
  for (const room of documents.values()) {
    if (room.kind !== "rooms") continue
    const places = (room.guest_sleeping_places ?? []) as GuestPlace[],
      capacity = Number(room.guest_capacity ?? 0)
    if (places.length !== capacity) errors.push(`${room.id}: guest capacity does not match individual guest places`)
    const used = new Set<string>(),
      ordinary = new Set(((room.sleeping_places ?? []) as { grid_symbol?: string }[]).map((p) => p.grid_symbol))
    for (const place of places) {
      for (const id of [place.id, place.luggage_id]) {
        if (!id || ids.has(id)) errors.push(`${room.id}: duplicate or missing guest bed/luggage ID`)
        ids.add(id)
      }
      for (const entry of [
        [place.grid_symbol, "bed"],
        [place.luggage_symbol, "luggage_storage"],
      ] as const) {
        const symbol = entry[0]
        const role = entry[1]

        if (!symbol) {
          if (room.grid || room.design_gate === "通過") errors.push(`${room.id}: guest ${role} has no grid placement`)
          continue
        }
        if (used.has(symbol) || ordinary.has(symbol)) errors.push(`${room.id}: guest furniture is shared with another sleeping place`)
        used.add(symbol)
        const furniture = room.furniture?.find((f) => f.symbol === symbol)
        if (!room.grid || furniture?.role !== role) errors.push(`${room.id}: guest ${role} furniture does not match`)
        if (furniture && room.grid && role === "bed") {
          const sides = furniture.rect
            .slice(2)
            .map((n) => n * room.grid!.cell_m)
            .sort((a, b) => a - b)
          if (sides[0] < MIN_BED_WIDTH_M || sides[1] < MIN_BED_LENGTH_M) errors.push(`${room.id}: guest bed is too small`)
        }
      }
    }
    if (room.grid)
      for (const furniture of room.furniture ?? [])
        if (furniture.role === "bed" && !used.has(furniture.symbol) && !ordinary.has(furniture.symbol)) errors.push(`${room.id}: bed furniture has no guest or resident assignment`)
  }
  return errors
}
