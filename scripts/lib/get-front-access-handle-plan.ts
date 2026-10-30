import { calculateFrontAccessHandlePlan } from "#/scripts/lib/calculate-front-access-handle-plan"
import type { FrontAccessPlanFrame } from "#/scripts/lib/front-access-plan-frame-types"
type Props = Parameters<typeof calculateFrontAccessHandlePlan>[0] & Readonly<{ prepared?: FrontAccessPlanFrame }>

/** Reuse only within the same synchronous review; different source documents never borrow another cabinet's plan. */
export function getFrontAccessHandlePlan(props: Props) {
  if (!props.prepared) return calculateFrontAccessHandlePlan(props)
  const prepared = props.prepared
  if (prepared.room !== props.room || prepared.building !== props.building || prepared.slot !== props.slot) return new Error("Prepared cabinet plan belongs to different source documents")
  return prepared.read()
}
