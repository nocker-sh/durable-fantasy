import { getBoxLidPlan } from "#/world/town/get-box-lid-plan"
type Props = Omit<Parameters<typeof getBoxLidPlan>[0], "support" | "handle">

/** A loose lid leaves a grounded box and returns along the same certified path; its contents never move with it. */
export function getGroundBoxLidPlan(props: Props) {
  if (props.box.y0 !== 0 || props.rest[1] !== 0) return new Error("Box and lid rest must use the room floor")

  return getBoxLidPlan({ ...props, support: null, handle: null })
}
