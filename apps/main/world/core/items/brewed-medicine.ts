import { medicine } from "#/world/core/items/medicine"
import type { MedicineProps as Props } from "#/world/core/items/factory-types"
import type { ItemDefinition } from "#/world/core/items/types"

/** Brewed remedies retain the plain medicine definition and add maker-quality support. */
export function brewedMedicine(props: Props): ItemDefinition {
  return { ...medicine(props), made: true }
}
