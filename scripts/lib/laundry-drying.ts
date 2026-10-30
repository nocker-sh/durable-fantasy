import { auditClothDrying } from "#/scripts/lib/audit-cloth-drying"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type DryingPlan = { racks: { furniture: string; handler: string }[]; capacity_status: string }
/** Place hanging cloth as occupied furniture; a rack is not evidence of drying capacity. */
export function auditLaundryDrying(documents: ReadonlyMap<string, SettingDocument>): string[] {
  const errors: string[] = []
  for (const room of documents.values()) {
    errors.push(...auditClothDrying(room))
    const plan = room.laundry_drying as DryingPlan | undefined
    if (!plan) {
      if (room.furniture?.some((f) => f.role === "drying_rack")) errors.push(`${room.id}: Drying rack has no drying plan`)
      continue
    }
    const fail = (problem: string) => errors.push(`${room.id}: ${problem}`)
    if (room.kind !== "rooms" || !room.grid) {
      fail("Drying plan has no room grid")
      continue
    }
    const building = documents.get(String(room.building)),
      used = new Set<string>()
    if (!plan.racks.length) fail("Drying plan has no racks")
    for (const rack of plan.racks) {
      if (used.has(rack.furniture)) fail("Drying rack is assigned more than once")
      used.add(rack.furniture)
      const furniture = room.furniture?.find((f) => f.symbol === rack.furniture),
        handler = documents.get(rack.handler)
      if (furniture?.role !== "drying_rack") fail("Drying rack has no matching occupied furniture")
      if (handler?.kind !== "residents" || !(building?.residents as string[] | undefined)?.includes(rack.handler) || !(room.occupants as string[] | undefined)?.includes(handler.title))
        fail("Drying handler does not belong to the home and room")
    }
    for (const furniture of room.furniture ?? []) if (furniture.role === "drying_rack" && !used.has(furniture.symbol)) fail("Drying rack has no assigned handler")
    if (room.design_gate === "通過" && plan.capacity_status === "unverified") fail("Drying capacity and operation remain unverified")
  }
  return errors
}
