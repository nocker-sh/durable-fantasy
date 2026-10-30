import { getWoolPreparationZonesError } from "#/scripts/lib/get-wool-preparation-zones-error"
import { getWoolPreparationVesselsError } from "#/scripts/lib/get-wool-preparation-vessels-error"
import { getWoolPreparationOperatorError } from "#/scripts/lib/get-wool-preparation-operator-error"
import { potableWaterCollectionSchema } from "#/scripts/lib/potable-water-supply-schema"
import { WOOL_PREPARATION_STATIONS } from "#/scripts/lib/wool-preparation-stations"
import { woolPreparationSchema } from "#/scripts/lib/wool-preparation-schema"
import { getWoolPreparationWaterBudget } from "#/world/town/get-wool-preparation-water-budget"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ facility: SettingDocument; supplier: SettingDocument; poolId: string; documents: ReadonlyMap<string, SettingDocument> }>

/** Check a supplier's proposed separate work faces and one service interval, never treating an unplaced facility as operating. */
export function getWoolPreparationFacilityReview(props: Props) {
  const parsed = woolPreparationSchema.safeParse(props.facility.wool_preparation),
    facility = props.facility,
    supplier = props.supplier
  if (!parsed.success) return new Error("Wool preparation has no matching operator and separate facility")
  const operator = getWoolPreparationOperatorError({ facility, supplier })
  if (operator) return operator
  const plan = parsed.data
  if (plan.operator !== supplier.id || plan.raw_pool !== props.poolId || !facility.grid || new Set(Object.values(plan.stations)).size !== WOOL_PREPARATION_STATIONS.length)
    return new Error("Wool preparation shares a station or belongs to another raw pool")
  for (const station of WOOL_PREPARATION_STATIONS) {
    const matches = facility.furniture?.filter((piece) => piece.symbol === plan.stations[station.station])
    if (matches?.length !== 1 || matches[0].role !== station.role || matches[0].owner !== supplier.title || !matches[0].access.length || !matches[0].use_space?.length)
      return new Error("Wool preparation lacks a separate station and work face")
  }
  const waterSource = props.documents.get(plan.water_source),
    collection = potableWaterCollectionSchema.safeParse(waterSource?.water_collection)
  if (
    !collection.success ||
    waterSource?.kind !== "facilities" ||
    waterSource.town !== facility.town ||
    waterSource.id === facility.id ||
    !Array.isArray(waterSource.users) ||
    !waterSource.users.includes(supplier.id)
  )
    return new Error("Wool preparation has no declared source-water user")
  const water = plan.water_budget,
    budget = getWoolPreparationWaterBudget({
      washMl: water.wash_ml,
      rinseMl: water.rinse_ml,
      rinseChanges: water.rinse_changes,
      handwashMl: water.handwash_ml,
      supplyMl: water.supply_ml,
      effluentMl: water.effluent_ml,
      batchesBeforeService: water.batches_before_service,
    })
  if (budget instanceof Error) return budget
  const vessels = getWoolPreparationVesselsError({ facility, plan })
  if (vessels) return vessels
  const zones = getWoolPreparationZonesError({ facility, plan })
  if (zones) return zones

  return { source: plan, water: budget }
}
