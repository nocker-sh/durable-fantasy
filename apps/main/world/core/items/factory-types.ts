import type { ItemIcon } from "#/world/core/items/icons"
import type { Equipment, ItemDefinition } from "#/world/core/items/types"
import type { GatherSkill, Rarity } from "#/world/core/items/kinds"

type Base = { name: string; price: number; icon: ItemIcon; description: string }
export type FoodProps = Readonly<Base & { hp: number; weight?: number }>
export type DishProps = Readonly<Base & { use: NonNullable<ItemDefinition["use"]>; weight?: number; rarity?: Rarity }>
export type MedicineProps = Readonly<Base & { use: { hp?: number; sp?: number }; rarity?: Rarity; weight?: number }>
export type ToolProps = Readonly<Base & { skill: GatherSkill; power: number; durability: number; weight: number; equip?: Equipment }>
export type MaterialProps = Readonly<Base & { rarity?: Rarity; weight?: number }>
export type GearProps = Readonly<Base & { equip: Equipment; weight: number; rarity?: Rarity }>
