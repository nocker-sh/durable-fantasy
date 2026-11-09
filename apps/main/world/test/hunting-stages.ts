import type { ItemId } from "#/world/core/items/catalog"
import type { Stats } from "#/world/core/growth-types"
import type { SkillId } from "#/world/core/skill-types"

type Stage = Readonly<{ level: 12 | 22 | 32; build: "sword" | "mage"; weapon: ItemId; stats: Stats; arts: readonly SkillId[]; kind: string; map: string }>

/** Explicit balance fixtures: earned-point budgets, available iron-based equipment, no advanced life skills. */
export const HUNTING_STAGES: readonly Stage[] = [
  { level: 12, build: "sword", weapon: "iron-sword", stats: { vit: 14, mnd: 8, str: 18, dex: 12, int: 5, fth: 5 }, arts: ["hew", "lunge"], kind: "iron-sand-slime", map: "red-dunes" },
  { level: 12, build: "mage", weapon: "oak-staff", stats: { vit: 12, mnd: 13, str: 10, dex: 5, int: 17, fth: 5 }, arts: ["flare", "ember"], kind: "iron-sand-slime", map: "red-dunes" },
  { level: 22, build: "sword", weapon: "reinforced-sword", stats: { vit: 22, mnd: 12, str: 22, dex: 16, int: 5, fth: 5 }, arts: ["hew", "lunge"], kind: "resin-slime", map: "deep-forest" },
  { level: 22, build: "mage", weapon: "resin-staff", stats: { vit: 18, mnd: 19, str: 10, dex: 6, int: 24, fth: 5 }, arts: ["flare", "ember"], kind: "resin-slime", map: "deep-forest" },
  { level: 32, build: "sword", weapon: "tempered-sword", stats: { vit: 30, mnd: 13, str: 26, dex: 22, int: 5, fth: 5 }, arts: ["hew", "lunge"], kind: "old-moss-slime", map: "deep-forest" },
  { level: 32, build: "mage", weapon: "root-staff", stats: { vit: 22, mnd: 24, str: 10, dex: 11, int: 30, fth: 5 }, arts: ["flare", "ember"], kind: "old-moss-slime", map: "deep-forest" },
]
