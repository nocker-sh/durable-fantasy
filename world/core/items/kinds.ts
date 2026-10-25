export type ItemKind = "consumable" | "equipment" | "tool" | "material" | "crystal" | "key";

export type Rarity = "common" | "fine" | "rare" | "treasure";

/** The gathering skills (economy.md §1): each has its own proficiency. */
export const GATHER_SKILLS = ["woodcutting", "fishing", "foraging"] as const;

export type GatherSkill = (typeof GATHER_SKILLS)[number];

/** The making skills (economy.md §2). */
export const CRAFT_SKILLS = ["cooking", "alchemy", "carpentry", "smithing", "tailoring"] as const;

export type CraftSkill = (typeof CRAFT_SKILLS)[number];

export type Skill = GatherSkill | CraftSkill;

/** The grades a weapon's attack grows with a stat by (game-system.md §3.4). */
export const GRADES = { E: 0.2, D: 0.4, C: 0.6, B: 0.8, A: 1, S: 1.2 } as const;

export type Grade = keyof typeof GRADES;

export const GATHER_SKILL_NAME: Record<Skill, string> = {
  woodcutting: "木こり",
  fishing: "釣り",
  foraging: "採取",
  cooking: "料理",
  alchemy: "調合",
  carpentry: "木工",
  smithing: "鍛冶",
  tailoring: "仕立て",
};

export const RARITY_NAME: Record<Rarity, string> = { common: "普通", fine: "上質", rare: "希少", treasure: "至宝" };

/** Quality of a thing someone made (game-system.md §4.2.1): 並・良・上・極. */
export const QUALITIES = ["並", "良", "上", "極"] as const;

export type Quality = 0 | 1 | 2 | 3;

/** how much better it works, and how much more it costs, by quality */
export const QUALITY_EFFECT = [0.8, 1, 1.2, 1.45] as const;

export const QUALITY_PRICE = [0.75, 1, 1.35, 1.9] as const;

export const KIND_NAME: Record<ItemKind, string> = { consumable: "消耗品", equipment: "装備品", tool: "道具", material: "素材", crystal: "結晶", key: "大事なもの" };

export const SLOTS = ["head", "neck", "body", "weapon", "shield", "feet", "accessory1", "accessory2"] as const;

export type Slot = (typeof SLOTS)[number];

export const SLOT_NAME: Record<Slot, string> = {
  head: "頭",
  neck: "首巻き",
  body: "体",
  weapon: "武器",
  shield: "盾",
  feet: "足",
  accessory1: "装飾品",
  accessory2: "装飾品",
};
