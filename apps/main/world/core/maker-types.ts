import type { ItemIcon } from "#/world/core/items/icons"

export type Trait = {
  /** how likely each quality is, 並・良・上・極 (they need not add to 1) */
  tiers: readonly [number, number, number, number]
  /** works this much better or worse than the plain recipe */
  effect?: number
  /** leans: more SP and less HP, minutes of warmth on top, stamina on top */
  sp?: number
  warm?: number
  stamina?: number
  /** price against the plain recipe */
  price?: number
  /** what people say of it, after the item's own description */
  note: string
  /** the bottle or bowl it comes in */
  icon?: ItemIcon
}
