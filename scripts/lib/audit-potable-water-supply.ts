import { getPotableWaterStockPlanError } from "#/scripts/lib/get-potable-water-stock-plan-error"
import { getPotableWaterCollectionError } from "#/scripts/lib/get-potable-water-collection-error"
import { potableWaterSupplySchema } from "#/scripts/lib/potable-water-supply-schema"
import { getPotableWaterHandlingLimit } from "#/scripts/lib/get-potable-water-handling-limit"
import { getPotableWaterVesselError } from "#/scripts/lib/get-potable-water-vessel-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Cross-reference a proposed household supply without certifying water quality, physical routes or enough water for a day. */
export function auditPotableWaterSupply(room: SettingDocument, documents: ReadonlyMap<string, SettingDocument>): string[] {
  const collection = getPotableWaterCollectionError(room),
    errors = collection ? [`${room.id}: ${collection.message}`] : []
  if (room.potable_water_supply === undefined) return errors
  const parsed = potableWaterSupplySchema.safeParse(room.potable_water_supply)
  if (room.kind !== "rooms" || !parsed.success) return [`${room.id}: Invalid planned water supply`]
  if (room.design_gate === "通過") errors.push(`${room.id}: Water collection and daily supply remain unverified`)
  const dependencies = room.design_dependencies
  if (!Array.isArray(dependencies) || ![room.building, parsed.data.source, parsed.data.carrier].every((id) => dependencies.includes(id)))
    errors.push(`${room.id}: Water supply prerequisites are missing`)
  const limit = getPotableWaterHandlingLimit({ room, documents, supply: parsed.data })
  if (limit instanceof Error) return [...errors, `${room.id}: ${limit.message}`]
  const vessel = getPotableWaterVesselError({ room, supply: parsed.data, handlingLimit: limit })
  if (vessel) errors.push(`${room.id}: ${vessel.message}`)
  const stock = getPotableWaterStockPlanError({ room, documents, supply: parsed.data })
  if (stock) errors.push(`${room.id}: ${stock.message}`)

  return errors
}
