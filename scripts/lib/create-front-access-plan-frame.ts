import { calculateFrontAccessHandlePlan } from "#/scripts/lib/calculate-front-access-handle-plan"
import type { FrontAccessPlanFrame } from "#/scripts/lib/front-access-plan-frame-types"
type Props = Parameters<typeof calculateFrontAccessHandlePlan>[0]

/** Preserve first-use validation order and share one fixed plan only during this synchronous review. */
export function createFrontAccessPlanFrame(props: Props): FrontAccessPlanFrame {
  const saved: { plan: ReturnType<typeof calculateFrontAccessHandlePlan> | null } = { plan: null }
  return {
    room: props.room,
    building: props.building,
    slot: props.slot,
    read: () => {
      if (saved.plan === null) saved.plan = calculateFrontAccessHandlePlan(props)
      return saved.plan
    },
  }
}
