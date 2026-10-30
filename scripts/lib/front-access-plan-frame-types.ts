import type { calculateFrontAccessHandlePlan } from "#/scripts/lib/calculate-front-access-handle-plan"
type Source = Parameters<typeof calculateFrontAccessHandlePlan>[0]
export type FrontAccessPlanFrame = Readonly<{ room: Source["room"]; building: Source["building"]; slot: Source["slot"]; read: () => ReturnType<typeof calculateFrontAccessHandlePlan> }>
