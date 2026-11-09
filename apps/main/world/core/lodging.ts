import type { ShopId } from "#/world/core/shop-types"

// The inns that let a bed for a rest, and what a stay costs (game-system.md §3.6). The tavern pours, it does not let rooms.
export const LODGING: Partial<Record<ShopId, number>> = { inn: 40 }
