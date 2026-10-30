import type { ItemIcon } from "#/world/core/items/icons"
import type { Grade } from "#/world/core/items/kinds"
import type { Stat } from "#/world/core/growth-types"
import type { METALS } from "#/world/core/items/weapon-metals"
import type { WEAPON_SHAPES } from "#/world/core/items/weapon-shapes"
import type { REMADE_WEAPONS } from "#/world/core/items/remade-weapons"

export type Shape = {
  /** the name after 「〇〇の」 */
  name: string
  icon: ItemIcon
  atk: number
  delay: number
  needs: Partial<Record<Stat, number>>
  scale: Partial<Record<Stat, Grade>>
  twoHanded?: true
  weight: number
  /** the iron one's price */
  price: number
  /** iron, plank and grip leather it takes at the forge, and the smithing level it opens at (recipes/smithing.ts) */
  forge: { iron: number; plank: number; fur: number; min: 2 | 4 | 8 }
  /** what it is for, after what it is made of */
  text: string
}

export type Metal = (typeof METALS)[number]
export type ShapeId = keyof typeof WEAPON_SHAPES
export type RemadeId = keyof typeof REMADE_WEAPONS
export type WeaponId = `${Metal}-${ShapeId}` | `${Exclude<Metal, "iron">}-${RemadeId}`
