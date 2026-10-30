import { getFrontAccessHandlePlan } from "#/scripts/lib/get-front-access-handle-plan"
type Props = Parameters<typeof getFrontAccessHandlePlan>[0]

/** Return the same nominal spare used by the cabinet and its clearance checks. */
export function getFrontAccessSpareBlanketReview(props: Props) {
  const plan = getFrontAccessHandlePlan(props)
  if (plan instanceof Error) return plan
  if (!plan.spareBlanket) return new Error("Missing cabinet-top spare blanket proposal")

  return plan.spareBlanket
}
