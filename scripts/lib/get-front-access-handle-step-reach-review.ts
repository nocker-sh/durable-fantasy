import { getFrontAccessHandleStepContext } from "#/scripts/lib/get-front-access-handle-step-context"
import { getFrontAccessHandleFrame } from "#/scripts/lib/get-front-access-handle-frame"
import { getNativeSideStepLegIntervals } from "#/world/scene/figure/get-native-side-step-leg-intervals"
type Props = Omit<Parameters<typeof getFrontAccessHandleStepContext>[0], "leaf" | "cycle" | "phase">
type Review = Readonly<{ leaf: "north" | "south"; intervals: Exclude<ReturnType<typeof getNativeSideStepLegIntervals>, Error> }>

/** Repeated cycles share the same local leg chain; certify both actual leaf distances and directions without granting geometry or load clearance. */
export function getFrontAccessHandleStepReachReview(props: Props): readonly Review[] | Error {
  if (!props.slot.packing?.front_access?.handle_review?.step_review?.reach_review) return new Error("Missing native leg interval proposal")
  const reviews: Review[] = [],
    directions: Readonly<Record<"north" | "south", "left" | "right">> = { north: "right", south: "left" }

  for (const leaf of ["north", "south"] satisfies ("north" | "south")[]) {
    const context = getFrontAccessHandleStepContext({ ...props, leaf, cycle: 0, phase: 0 }),
      frame = getFrontAccessHandleFrame({ ...props, leaf, progress: 0 })
    if (context instanceof Error) return context
    if (frame instanceof Error) return frame
    const intervals = getNativeSideStepLegIntervals({
      look: frame.look,
      native: frame.native,
      pelvisDrop: context.source.standing_support.pelvis_drop_m,
      stride: context.stride,
      lift: context.step.foot_lift_m,
      direction: directions[leaf],
    })
    if (intervals instanceof Error) return intervals
    reviews.push({ leaf, intervals })
  }

  return reviews
}
