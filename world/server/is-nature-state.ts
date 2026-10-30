import { natureStateSchema } from "#/world/server/nature-state-schema"
import type { NatureState } from "#/world/core/nature/types"

/** Narrow the original saved state without discarding unknown node metadata. */
export function isNatureState(saved: unknown): saved is NatureState {
  return natureStateSchema.safeParse(saved).success
}
