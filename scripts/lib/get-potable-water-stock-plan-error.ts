import { createWaterStock } from "#/world/core/create-water-stock"
import type { potableWaterSupplySchema } from "#/scripts/lib/potable-water-supply-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Props = { room: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; supply: z.infer<typeof potableWaterSupplySchema> }

/** Every listed home user belongs to the same household; validating accounting does not validate a day's supply. */
export function getPotableWaterStockPlanError(props: Props): Error | null {
  const plan = props.supply.stock_plan
  const stock = createWaterStock(props.supply.max_fill_l * 1000, 0)
  if (stock instanceof Error) return new Error("Household water fill must fit an exact millilitre ledger", { cause: stock })
  const occupants = props.room.occupants,
    home = props.documents.get(String(props.room.building)),
    dependencies = props.room.design_dependencies,
    names = new Set<string>()
  if (!Array.isArray(dependencies) || plan.users.some((id) => !dependencies.includes(id))) return new Error("Water stock user prerequisites are missing")
  if (
    !Array.isArray(occupants) ||
    occupants.some((name) => typeof name !== "string") ||
    new Set(occupants).size !== occupants.length ||
    new Set(plan.users).size !== plan.users.length ||
    plan.users.length !== occupants.length
  )
    return new Error("Water stock plan does not cover each home user once")
  for (const id of plan.users) {
    const resident = props.documents.get(id)
    if (
      resident?.kind !== "residents" ||
      !occupants.includes(resident.title) ||
      !Array.isArray(resident.buildings) ||
      !resident.buildings.includes(props.room.building) ||
      resident.town !== props.room.town ||
      home?.kind !== "buildings" ||
      resident.household !== home.household ||
      !Array.isArray(home.residents) ||
      !home.residents.includes(id) ||
      names.has(resident.title)
    )
      return new Error("Water stock user does not belong to this home")
    names.add(resident.title)
  }

  return null
}
