import { marketStateSchema } from "#/world/server/market-state-schema"
import type { MarketState } from "#/world/core/market-types"

/** Inspect the saved value without replacing it with Zod's metadata-stripped parse output. */
export function isMarketState(saved: unknown): saved is MarketState {
  return marketStateSchema.safeParse(saved).success
}
