import type { ItemIcon } from "./icons.ts";
import type { ItemDefinition, Equipment } from "./types.ts";
import type { Rarity, GatherSkill } from "./kinds.ts";

/** Raw food: fruit, vegetables, fish. Filling, but it neither warms nor keeps you going for long. */
const food = (name: string, price: number, hp: number, icon: ItemIcon, description: string, weight = 2): ItemDefinition => ({
  name,
  kind: "consumable",
  rarity: "common",
  description,
  price,
  stack: 99,
  weight,
  icon,
  use: { hp, stamina: Math.ceil(hp / 2), full: Math.ceil(hp * 0.7) },
});

/** Cooked food and drink: what it restores, how filling it is, how long it keeps you warm. */
const dish = (name: string, price: number, use: NonNullable<ItemDefinition["use"]>, icon: ItemIcon, description: string, weight = 3, rarity: Rarity = "common"): ItemDefinition => ({
  name,
  kind: "consumable",
  rarity,
  description,
  price,
  stack: 30,
  weight,
  icon,
  use,
  made: true,
});

const medicine = (name: string, price: number, use: { hp?: number; sp?: number }, icon: ItemIcon, description: string, rarity: Rarity = "common", weight = 5): ItemDefinition => ({
  name,
  kind: "consumable",
  rarity,
  description,
  price,
  stack: 99,
  weight,
  icon,
  use,
});

const tool = (name: string, price: number, icon: ItemIcon, skill: GatherSkill, power: number, durability: number, description: string, weight: number, equip?: Equipment): ItemDefinition => ({
  name,
  kind: "tool",
  rarity: "common",
  description,
  price,
  stack: 1,
  weight,
  icon,
  tool: { skill, power, durability },
  made: true,
  ...(equip ? { equip } : {}),
});

const material = (name: string, price: number, icon: ItemIcon, description: string, rarity: Rarity = "common", weight = 1): ItemDefinition => ({
  name,
  kind: "material",
  rarity,
  description,
  price,
  stack: 99,
  weight,
  icon,
});

const gear = (name: string, price: number, icon: ItemIcon, equip: Equipment, weight: number, description: string, rarity: Rarity = "common"): ItemDefinition => ({
  name,
  kind: "equipment",
  rarity,
  description,
  price,
  stack: 1,
  weight,
  icon,
  equip,
});

export { food, dish, medicine, tool, material, gear };
