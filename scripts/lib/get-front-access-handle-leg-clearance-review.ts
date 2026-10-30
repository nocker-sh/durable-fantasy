import { getFrontAccessHandleLegObstacleContext } from "#/scripts/lib/get-front-access-handle-leg-obstacle-context"
import { getNativeSideStepLegExternalIntervals } from "#/world/scene/figure/get-native-side-step-leg-external-intervals"
type Props = Omit<Parameters<typeof getFrontAccessHandleLegObstacleContext>[0], "leaf">
type Review = Readonly<{ leaf: "north" | "south"; intervals: Exclude<ReturnType<typeof getNativeSideStepLegExternalIntervals>, Error> }>

/** Every repeated local step is enclosed against all whole-walk relative obstacles; this proves external leg clearance, not skirt, upper-body or self clearance. */
export function getFrontAccessHandleLegClearanceReview(props: Props): readonly Review[] | Error {
  if (!props.slot.packing?.front_access?.handle_review?.step_review?.leg_clearance_review) return new Error("Missing native leg external interval proposal")
  const reviews: Review[] = [],
    directions: Readonly<Record<"north" | "south", "left" | "right">> = { north: "right", south: "left" }

  for (const leaf of ["north", "south"] satisfies ("north" | "south")[]) {
    const context = getFrontAccessHandleLegObstacleContext({ ...props, leaf })
    if (context instanceof Error) return context
    const intervals = getNativeSideStepLegExternalIntervals({
      look: context.start.look,
      native: context.start.native,
      pelvisDrop: context.step.source.standing_support.pelvis_drop_m,
      stride: context.step.stride,
      lift: context.step.step.foot_lift_m,
      direction: directions[leaf],
      boxes: context.boxes,
      ceiling: context.ceiling,
    })
    if (intervals instanceof Error) return intervals
    reviews.push({ leaf, intervals })
  }

  return reviews
}
