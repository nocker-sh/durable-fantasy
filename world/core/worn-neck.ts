import type { PlayerState, NeckKind } from "#/world/core/player-types"
import { ITEMS } from "#/world/core/items/catalog"

/** The neck wrap others see: a worn one, or else the one chosen in the character screen. */
export function wornNeck(p: Pick<PlayerState, "equipment" | "neck" | "neckRamp">): { neck: NeckKind; neckRamp: string; neckStripe?: string } {
  const worn = p.equipment.neck ? ITEMS[p.equipment.neck].equip?.look : undefined
  return worn ?? { neck: p.neck, neckRamp: p.neckRamp }
}
