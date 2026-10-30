import type { SettingDocument } from "#/scripts/lib/setting-document"
type Storage = { id: string; resident: string; contents: string[]; furniture_symbol?: string | null; compartment: string }
/** An assigned ID is not a placed cabinet; a shared cabinet still has distinct personal compartments. */
export function auditPersonalStorage(documents: ReadonlyMap<string, SettingDocument>): string[] {
  const errors: string[] = [],
    ids = new Map<string, Storage>(),
    assignments = new Map<string, string[]>(),
    compartments = new Set<string>()
  for (const room of documents.values()) {
    if (room.kind !== "rooms") continue
    for (const slot of (room.personal_storage ?? []) as Storage[]) {
      if (ids.has(slot.id)) errors.push(`${room.id}: duplicate personal storage ID`)
      ids.set(slot.id, slot)
      const resident = documents.get(slot.resident),
        building = documents.get(String(room.building))
      if (resident?.kind !== "residents" || !(building?.residents as string[] | undefined)?.includes(slot.resident)) {
        errors.push(`${room.id}: storage owner does not live in the building`)
        continue
      }
      const owned = assignments.get(slot.resident) ?? []
      owned.push(slot.id)
      assignments.set(slot.resident, owned)
      if (!["衣服", "首巻き", "私物"].every((item) => slot.contents.includes(item))) errors.push(`${slot.id}: missing personal belongings category`)
      if (slot.furniture_symbol) {
        const furniture = room.furniture?.find((f) => f.symbol === slot.furniture_symbol)
        const owners = furniture?.owners as string[] | undefined
        if (!room.grid || !furniture || furniture.role !== "storage" || !(owners ?? [furniture.owner]).includes(resident.title)) errors.push(`${slot.id}: storage furniture or owner does not match`)
        const shared = ((room.personal_storage ?? []) as Storage[]).filter((other) => other.furniture_symbol === slot.furniture_symbol).length > 1
        if ((shared || furniture?.compartments) && !furniture?.compartments?.includes(slot.compartment)) errors.push(`${slot.id}: compartment is not defined on the storage furniture`)
        const key = `${room.id}:${slot.furniture_symbol}:${slot.compartment}`
        if (!slot.compartment || compartments.has(key)) errors.push(`${slot.id}: personal compartment is already assigned`)
        compartments.add(key)
      } else if (room.grid || room.design_gate === "通過") errors.push(`${slot.id}: storage has no grid placement`)
    }
    for (const bed of (room.sleeping_places ?? []) as { resident: string; storage_id?: string }[]) {
      const slot = ((room.personal_storage ?? []) as Storage[]).find((s) => s.id === bed.storage_id)
      if (!slot || slot.resident !== bed.resident) errors.push(`${room.id}: bed and personal storage owner disagree`)
    }
  }
  for (const resident of documents.values())
    if (resident.kind === "residents") {
      const linked = resident.storage_ids as string[] | undefined,
        owned = assignments.get(resident.id) ?? []
      if (
        !Array.isArray(linked) ||
        !linked.length ||
        new Set(linked).size !== linked.length ||
        linked.length !== owned.length ||
        !linked.every((id) => ids.get(id)?.resident === resident.id && owned.includes(id))
      )
        errors.push(`${resident.id}: unresolved or inconsistent personal storage`)
    }
  return errors
}
