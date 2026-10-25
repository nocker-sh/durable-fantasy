// Public entry points; implementation lives in focused modules.
export {
  type ItemKind,
  type Rarity,
  GATHER_SKILLS,
  type GatherSkill,
  CRAFT_SKILLS,
  type CraftSkill,
  type Skill,
  GRADES,
  type Grade,
  GATHER_SKILL_NAME,
  RARITY_NAME,
  QUALITIES,
  type Quality,
  QUALITY_EFFECT,
  QUALITY_PRICE,
  KIND_NAME,
  SLOTS,
  type Slot,
  SLOT_NAME,
} from "./items/kinds.ts"
export { type EquipPart, type Equipment, type ItemDefinition } from "./items/types.ts"
export { ITEM_ICONS, type ItemIcon } from "./items/icons.ts"
export { type ItemId, ITEMS, ITEM_IDS } from "./items/catalog.ts"
export { isItemId, sellPrice, sellable, slotsFor } from "./items/rules.ts"
