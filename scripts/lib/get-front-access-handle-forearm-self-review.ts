import { getFrontAccessHandleExternalObstacleContext } from "#/scripts/lib/get-front-access-handle-external-obstacle-context"
import { getNativeRigidForearmSelfIntervals } from "#/world/scene/figure/get-native-rigid-forearm-self-intervals"
type Props = Omit<Parameters<typeof getFrontAccessHandleExternalObstacleContext>[0], "leaf">
type Review = Readonly<{ leaf: "north" | "south"; intervals: Exclude<ReturnType<typeof getNativeRigidForearmSelfIntervals>, Error> }>

/** Forearm self-clearance is distinct from external furniture clearance and the remaining body, cane and load constraints. */
export function getFrontAccessHandleForearmSelfReview(props: Props): readonly Review[] | Error {
  const source = props.slot.packing?.front_access?.handle_review?.step_review
  if (!source?.forearm_self_review || !source.upper_clearance_review || !source.leg_clearance_review) return new Error("Forearm self review needs declared upper and leg interval proposals")
  const reviews: Review[] = [],
    directions: Readonly<Record<"north" | "south", "left" | "right">> = { north: "right", south: "left" }

  for (const leaf of ["north", "south"] satisfies ("north" | "south")[]) {
    const context = getFrontAccessHandleExternalObstacleContext({ ...props, leaf })
    if (context instanceof Error) return context
    const frame = context.start,
      intervals = getNativeRigidForearmSelfIntervals({
        look: frame.look,
        native: frame.native,
        reference: frame.posed.skeleton,
        pelvisDrop: context.step.source.standing_support.pelvis_drop_m,
        stride: context.step.stride,
        lift: context.step.step.foot_lift_m,
        direction: directions[leaf],
        ceiling: context.ceiling,
        hand: frame.hand,
        bar: frame.bar,
        pole: context.step.source.elbow_pole,
      })
    if (intervals instanceof Error) return intervals
    reviews.push({ leaf, intervals })
  }

  return reviews
}
