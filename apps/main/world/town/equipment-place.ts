import type { FurnitureKind } from "#/world/town/furniture-kinds"
import type { Interior } from "#/world/town/interiors"
import type { StationPlace } from "#/world/town/station-places"

type Props = {
  interiors: readonly Interior[]
  house: string
  kind: FurnitureKind
  name: string
}

/** Resolve an equipment identity explicitly; absent equipment must not become an unlocated station. */
export function equipmentPlace(props: Props): StationPlace {
  const interior = props.interiors.find((room) => room.house.id === props.house && room.floor === 0)
  if (!interior) throw new Error(`Station building has no ground-floor interior: ${props.house}`)
  const equipment = interior.furniture.find((furniture) => furniture.kind === props.kind && furniture.name === props.name)
  if (!equipment) throw new Error(`Station equipment is missing: ${props.house}/${props.kind}/${props.name}`)
  return { map: interior.id, cell: [Math.floor(equipment.x * 2), Math.floor(equipment.z * 2)] }
}
