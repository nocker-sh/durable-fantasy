import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ facility: SettingDocument; supplier: SettingDocument }>

/** The producer uses a dedicated private work area, keeping gardens, drinking-water collection and animal care separate. */
export function getWoolPreparationOperatorError(props: Props): Error | null {
  const facility = props.facility,
    supplier = props.supplier,
    message = "Wool preparation has no matching operator and separate facility"
  if (facility.kind !== "facilities" || supplier.kind !== "residents") return new Error(message)
  if (typeof supplier.town !== "string" || !supplier.town || facility.town !== supplier.town) return new Error(message)
  if (!Array.isArray(facility.users) || !facility.users.includes(supplier.id) || !Array.isArray(facility.caretakers) || !facility.caretakers.includes(supplier.id)) return new Error(message)
  if (typeof facility.owner_building !== "string" || !Array.isArray(supplier.buildings) || !supplier.buildings.includes(facility.owner_building)) return new Error(message)
  if (facility.ground_feature !== undefined || facility.water_collection !== undefined || facility.animal_care !== undefined) return new Error(message)

  return null
}
