import { createAuthoredHearthGeometry } from "#/world/scene/construction/create-authored-hearth-geometry"
import { createLegacyHearthGeometry } from "#/world/scene/construction/create-legacy-hearth-geometry"
import type { Furniture } from "#/world/town/interiors"
import type { FlueSection } from "#/world/town/floorplan/types"
type Props = { furniture: Furniture; floor: number; height: number; shaft: FlueSection | null }

/** A partially authored hearth never falls back to a decorative closed box. */
export function createInteriorHearthGeometry(props: Props) {
  const f = props.furniture
  if ((f.hearth && !props.shaft) || (props.shaft && (!f.hearth || !f.hearthFront)) || (f.cookingTop && !f.hearth)) return new Error("Authored hearth has no complete chamber and flue section")
  if (f.hearth && props.shaft) return createAuthoredHearthGeometry({ ...props, shaft: props.shaft })

  return createLegacyHearthGeometry(props)
}
