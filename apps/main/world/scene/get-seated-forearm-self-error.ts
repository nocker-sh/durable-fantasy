import { getForearmSelfClearanceError } from "#/world/scene/figure/get-forearm-self-clearance-error"
type Props = Omit<Parameters<typeof getForearmSelfClearanceError>[0], "hand"> & { movingHand: "l" | "r" | null }
const hands: readonly ("l" | "r")[] = ["l", "r"]

/** The moving forearm's inflated surface covers its motion against the fixed torso and opposite arm. */
export function getSeatedForearmSelfError(props: Props): Error | null {
  if (props.movingHand === null && props.margin !== 0) return new Error("Static forearm self-clearance cannot have a motion margin")
  for (const hand of hands) {
    if (props.movingHand !== null && hand !== props.movingHand) continue
    const error = getForearmSelfClearanceError({ look: props.look, skeleton: props.skeleton, hand, margin: props.margin })
    if (error) return error
  }

  return null
}
