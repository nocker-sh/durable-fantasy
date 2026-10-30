import { getWaterVesselDefinition } from "#/scripts/lib/get-water-vessel-definition"
import type { potableWaterSupplySchema } from "#/scripts/lib/potable-water-supply-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Props = { room: SettingDocument; supply: z.infer<typeof potableWaterSupplySchema>; handlingLimit: number }
const PLANNED_WATER_DENSITY_KG_PER_L = 1

/** The same clean vessel is carried and stored; waste or washing routes cannot borrow its identity. */
export function getPotableWaterVesselError(props: Props): Error | null {
  const matches = props.room.furniture?.filter((part) => part.symbol === props.supply.container_symbol) ?? [],
    vessel = matches[0]?.transport_container
  if (!props.room.grid || matches.length !== 1 || !vessel || vessel.id !== props.supply.container_id) return new Error("Water supply has no matching placed vessel")
  if (vessel.stream !== "potable_water" || vessel.material !== "glazed_ceramic" || !vessel.lidded) return new Error("Water supply requires its dedicated lidded glazed vessel")
  if (![props.supply.max_fill_l, vessel.capacity_l, vessel.empty_mass_kg, props.handlingLimit].every((value) => Number.isFinite(value) && value > 0) || props.supply.max_fill_l > vessel.capacity_l)
    return new Error("Water operating fill exceeds capacity or has invalid mass")
  if (vessel.empty_mass_kg + props.supply.max_fill_l * PLANNED_WATER_DENSITY_KG_PER_L > props.handlingLimit) return new Error("Filled water vessel exceeds the carrier's planned hand load")
  if (
    Array.isArray(props.room.material_routes) &&
    props.room.material_routes.some(
      (route: unknown) =>
        route &&
        typeof route === "object" &&
        (("container_id" in route && route.container_id === vessel.id) || ("container_symbol" in route && route.container_symbol === props.supply.container_symbol)),
    )
  )
    return new Error("Drinking water vessel is reused by a waste route")

  if (matches[0].potable_vessel !== undefined) {
    const definition = getWaterVesselDefinition(matches[0])
    if (definition instanceof Error) return definition
    if (definition.profile.halfWidth * 2 > matches[0].rect[2] * props.room.grid.cell_m || definition.profile.radius * 2 > matches[0].rect[3] * props.room.grid.cell_m)
      return new Error("Water vessel handles leave the storage footprint")
  }
  const drying = props.room.dish_drying
  if (drying && typeof drying === "object" && Object.entries(drying).some((entry) => ["washed_at", "support", "dry_storage"].includes(entry[0]) && entry[1] === props.supply.container_symbol))
    return new Error("Drinking water vessel is reused by dish handling")

  return null
}
