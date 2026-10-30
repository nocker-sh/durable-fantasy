import { getFrontAccessHandlePlan } from "#/scripts/lib/get-front-access-handle-plan"
import { getEasedSideStepOffsets } from "#/world/town/get-eased-side-step-offsets"
import { smooth } from "#/lib/engine/smooth"
type Props = Parameters<typeof getFrontAccessHandlePlan>[0] & Readonly<{ leaf: "north" | "south"; cycle: number; phase: number }>

/** Each cycle follows its own actual leaf distance; both body and board stop smoothly at cycle boundaries. */
export function getFrontAccessHandleStepContext(props: Props) {
  const plan = getFrontAccessHandlePlan(props)
  if (plan instanceof Error) return plan
  const source = plan.source.step_review
  if (!source || !Number.isSafeInteger(source.cycles) || source.cycles < 1 || source.cycles > 16 || !Number.isSafeInteger(props.cycle) || props.cycle < 0 || props.cycle >= source.cycles)
    return new Error("Invalid raised-handle step cycle")
  if (!["north", "south"].includes(props.leaf)) return new Error("Invalid raised-handle step leaf")
  const directions: Readonly<Record<"north" | "south", "left" | "right">> = { north: "right", south: "left" },
    stride = plan.travel[props.leaf] / source.cycles
  const offsets = getEasedSideStepOffsets({ phase: props.phase, stride, lift: source.foot_lift_m, direction: directions[props.leaf] })
  if (offsets instanceof Error) return offsets

  return { source: plan.source, step: source, stride, offsets, progress: (props.cycle + smooth(0, 1, props.phase)) / source.cycles }
}
