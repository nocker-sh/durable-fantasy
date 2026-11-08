import { subtractCuboids } from "#/lib/engine/cuboid-subtraction"
import { getSlidingCabinetLeafDefinition } from "#/world/town/get-sliding-cabinet-leaf-definition"
import type { SlidingCabinetSpec, SlidingCabinetPart } from "#/world/town/sliding-cabinet-types"
type Props = Readonly<{ spec: SlidingCabinetSpec; leaf: "north" | "south"; offset: number }>

/** Finger holes move with their own leaf; no rear-leaf handle protrudes into the front track. */
export function getSlidingCabinetPanelParts(props: Props): readonly SlidingCabinetPart[] {
  const definition = getSlidingCabinetLeafDefinition(props)

  return subtractCuboids(definition.panel, [definition.pull]).map((piece) => ({ ...piece, part: "panel", leaf: props.leaf }))
}
