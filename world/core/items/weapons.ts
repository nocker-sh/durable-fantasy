// Weapons by shape and metal (game-system.md §4.3). Each shape is one way of fighting — a long
// blade, a hammer, a pole with an axe on it — and comes in the town's iron, in steel forged again
// past the smith's 16th milestone, and in the steel of the sunken engines past the 32nd
// (economy.md §2.1). The iron ones are Günter's; the others are only made, at the shared forge.
import type { Equipment, ItemDefinition } from "./types.ts"
import type { ItemIcon } from "./icons.ts"
import type { Grade, Rarity } from "./kinds.ts"
import type { Stat } from "../growth.ts"

export const METALS = ["iron", "steel", "engine"] as const

export type Metal = (typeof METALS)[number]

export const METAL_NAME: Record<Metal, string> = { iron: "鉄", steel: "鋼", engine: "機関鋼" }

/** How each metal changes a shape's weapon: attack, pace, what it asks of the arm, price, and the milestone that makes it. */
const METAL: Record<Metal, { atk: number; delay: number; needs: number; price: number; rarity?: Rarity; milestone?: 16 | 32 }> = {
  iron: { atk: 1, delay: 1, needs: 0, price: 1 },
  steel: { atk: 1.5, delay: 0.96, needs: 2, price: 4.2, rarity: "rare", milestone: 16 },
  engine: { atk: 1.9, delay: 0.94, needs: 4, price: 8.5, rarity: "rare", milestone: 32 },
}

interface Shape {
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
  /** iron, plank and grip leather it takes at the forge, and the smithing level it opens at (crafting.ts) */
  forge: { iron: number; plank: number; fur: number; min: 2 | 4 | 8 }
  /** what it is for, after what it is made of */
  text: string
}

/** The shapes the forge makes in all three metals. */
const SHAPES = {
  knife: {
    name: "狩猟刀",
    icon: "knife",
    atk: 12,
    delay: 1250,
    needs: { dex: 8 },
    scale: { dex: "C", str: "E" },
    weight: 30,
    price: 60,
    forge: { iron: 1, plank: 0, fur: 1, min: 2 },
    text: "獲物をさばくための刃の厚い小刀。森へ入る者はたいてい腰に下げている。",
  },
  machete: {
    name: "鉈",
    icon: "machete",
    atk: 17,
    delay: 1450,
    needs: { str: 8 },
    scale: { str: "D", dex: "D" },
    weight: 50,
    price: 75,
    forge: { iron: 2, plank: 1, fur: 0, min: 2 },
    text: "下草と枝を払う幅広の刃。藪から飛び出す魔物にもそのまま振るえる。",
  },
  longsword: {
    name: "長剣",
    icon: "longsword",
    atk: 30,
    delay: 1650,
    needs: { str: 10, dex: 9 },
    scale: { str: "C", dex: "D" },
    weight: 75,
    price: 260,
    forge: { iron: 3, plank: 1, fur: 1, min: 4 },
    text: "柄を長く取った片手剣。いざとなれば両手を添えられる。",
  },
  greatsword: {
    name: "両手剣",
    icon: "greatsword",
    atk: 44,
    delay: 2200,
    needs: { str: 14 },
    scale: { str: "B" },
    twoHanded: true,
    weight: 140,
    price: 420,
    forge: { iron: 5, plank: 1, fur: 1, min: 8 },
    text: "背丈ほどもある剣。畑を荒らす大物を追い払うのに、町に一本は要る。",
  },
  warhammer: {
    name: "戦鎚",
    icon: "warhammer",
    atk: 34,
    delay: 2000,
    needs: { str: 13 },
    scale: { str: "B" },
    weight: 120,
    price: 300,
    forge: { iron: 4, plank: 1, fur: 0, min: 8 },
    text: "四角い頭を長い柄に据えた鎚。硬い殻の魔物には刃より効く。",
  },
  flail: {
    name: "殻竿",
    icon: "flail",
    atk: 24,
    delay: 1800,
    needs: { str: 10, dex: 8 },
    scale: { str: "C", dex: "D" },
    weight: 80,
    price: 150,
    forge: { iron: 2, plank: 1, fur: 0, min: 4 },
    text: "麦を打つ殻竿の先を鉄にした。農家の納屋から出てきた戦い方。",
  },
  halberd: {
    name: "斧槍",
    icon: "halberd",
    atk: 40,
    delay: 2100,
    needs: { str: 11, dex: 10 },
    scale: { str: "C", dex: "C" },
    twoHanded: true,
    weight: 140,
    price: 360,
    forge: { iron: 4, plank: 2, fur: 0, min: 8 },
    text: "槍の穂先に斧の刃と鉤を付けた長柄。突いても払っても使える。",
  },
  estoc: {
    name: "刺突剣",
    icon: "estoc",
    atk: 26,
    delay: 1450,
    needs: { dex: 11 },
    scale: { dex: "B" },
    weight: 65,
    price: 240,
    forge: { iron: 3, plank: 0, fur: 1, min: 4 },
    text: "刃より切っ先で戦う細く硬い剣。殻の継ぎ目や鱗の間を突く。",
  },
  falchion: {
    name: "段平",
    icon: "falchion",
    atk: 22,
    delay: 1550,
    needs: { str: 9, dex: 8 },
    scale: { str: "C", dex: "D" },
    weight: 60,
    price: 130,
    forge: { iron: 2, plank: 0, fur: 1, min: 4 },
    text: "先へ行くほど幅の広がる片刃の剣。鍛冶場の見習いが最初に任される形。",
  },
  bill: {
    name: "鉤鎌",
    icon: "bill",
    atk: 33,
    delay: 2000,
    needs: { str: 10, dex: 9 },
    scale: { str: "C", dex: "D" },
    twoHanded: true,
    weight: 120,
    price: 200,
    forge: { iron: 3, plank: 2, fur: 0, min: 4 },
    text: "生け垣を刈る鉈鎌を長い柄に付けた。鉤で引き倒し、刃で払う。",
  },
  pick: {
    name: "戦嘴",
    icon: "pick",
    atk: 31,
    delay: 1850,
    needs: { str: 12 },
    scale: { str: "C", dex: "E" },
    weight: 100,
    price: 280,
    forge: { iron: 3, plank: 1, fur: 0, min: 8 },
    text: "つるはしの先を細く鍛えた鎚。硬い甲羅も一点に打てば割れる。",
  },
} satisfies Record<string, Shape>

export type ShapeId = keyof typeof SHAPES

/** Shapes the town already has in iron (catalog.ts), made again in the better metals. */
const IRON_ALREADY = {
  dagger: { name: "ダガー", base: { icon: "dagger", atk: 9, delay: 1200, needs: { dex: 7 }, scale: { dex: "C", str: "E" }, weight: 40, price: 40 }, text: "刃渡りの短い小刀。" },
  "hand-axe": { name: "手斧", base: { icon: "axe", atk: 20, delay: 1700, needs: { str: 9 }, scale: { str: "C" }, weight: 70, price: 90 }, text: "薪割りにも戦いにも使える。" },
  "battle-axe": {
    name: "戦斧",
    base: { icon: "axe", atk: 48, delay: 2300, needs: { str: 16 }, scale: { str: "B" }, twoHanded: true, weight: 150, price: 380 },
    text: "両手で振るう大きな斧。",
  },
  spear: {
    name: "槍",
    base: { icon: "spear", atk: 28, delay: 1900, needs: { str: 9, dex: 9 }, scale: { dex: "C", str: "D" }, twoHanded: true, weight: 100, price: 150 },
    text: "間合いの長い槍。両手で持つ。",
  },
  mace: { name: "メイス", base: { icon: "mace", atk: 26, delay: 1800, needs: { str: 12 }, scale: { str: "C" }, weight: 90, price: 180 }, text: "鉄の頭をもつ打撃武器。" },
} satisfies Record<string, { name: string; base: Omit<Shape, "name" | "forge" | "text">; text: string }>

export type RemadeId = keyof typeof IRON_ALREADY

/** What the better metals add to a weapon's description. */
const METAL_TEXT: Record<Metal, string> = {
  iron: "",
  steel: "鉄を炭で何度も鍛え直し、黒樫の柄を付けた。刃が欠けにくい。",
  engine: "沈んだ機関の芯の鋼で打った。いまの炉では、この硬さは出せない。",
}

export type WeaponId = `${Metal}-${ShapeId}` | `${Exclude<Metal, "iron">}-${RemadeId}`

const round = (n: number, to: number) => Math.round(n / to) * to

function weapon(metal: Metal, s: Omit<Shape, "forge" | "text">, text: string): ItemDefinition {
  const m = METAL[metal]
  const needs = Object.fromEntries(Object.entries(s.needs).map(([k, v]) => [k, v + m.needs])) as Equipment["needs"]
  const equip: Equipment = { part: "weapon", atk: Math.round(s.atk * m.atk), delay: round(s.delay * m.delay, 50), needs, scale: s.scale, ...(s.twoHanded ? { twoHanded: true } : {}) }
  return {
    made: true,
    name: `${METAL_NAME[metal]}の${s.name}`,
    kind: "equipment",
    rarity: m.rarity ?? "common",
    description: metal === "iron" ? text : `${text}${METAL_TEXT[metal]}`,
    price: round(s.price * m.price, 10),
    stack: 1,
    weight: Math.round(s.weight * (metal === "steel" ? 0.95 : 1)),
    icon: s.icon,
    metal,
    equip,
    ...(m.milestone ? { milestone: m.milestone } : {}),
  }
}

const made: Record<string, ItemDefinition> = {}
for (const [id, s] of Object.entries(SHAPES) as [ShapeId, Shape][]) for (const metal of METALS) made[`${metal}-${id}`] = weapon(metal, s, s.text)
for (const [id, s] of Object.entries(IRON_ALREADY) as [RemadeId, (typeof IRON_ALREADY)[RemadeId]][])
  for (const metal of ["steel", "engine"] as const) made[`${metal}-${id}`] = weapon(metal, { name: s.name, ...s.base }, s.text)

export const WEAPONS = made as Record<WeaponId, ItemDefinition>

/** The iron weapons of the new shapes, for the smith's stock. */
export const IRON_WEAPONS = Object.keys(SHAPES).map((id) => `iron-${id}` as WeaponId)

/** What making each weapon takes at the forge (crafting.ts): iron, a plank for the haft, leather for the grip; the better metals take the black oak heart and charcoal, and the engine's steel. */
export function forgeOf(id: WeaponId): { inputs: [string, number][]; min: number } {
  const [metal, ...rest] = id.split("-") as [Metal, ...string[]]
  const shape = rest.join("-")
  const f = shape in SHAPES ? SHAPES[shape as ShapeId].forge : { iron: 2, plank: 1, fur: 0, min: 4 as const }
  if (metal === "iron")
    return {
      inputs: [
        ["iron-ingot", f.iron],
        ...(f.plank ? ([["plank", f.plank]] as [string, number][]) : []),
        ...(f.fur ? ([["soft-fur", f.fur]] as [string, number][]) : []),
      ],
      min: f.min,
    }
  if (metal === "steel")
    return {
      inputs: [
        ["iron-ingot", f.iron * 2],
        ["black-oak-heart", 1],
        ["charcoal", 2],
      ],
      min: 16,
    }
  return {
    inputs: [
      ["engine-core", Math.max(1, Math.ceil(f.iron / 2))],
      ["iron-ingot", f.iron],
      ["black-oak-heart", 1],
      ["charcoal", 2],
    ],
    min: 32,
  }
}

/** The shape a weapon is, for the arts that go with it (skills.ts). */
export const weaponsOf = (...shapes: (ShapeId | RemadeId)[]) => (Object.keys(WEAPONS) as WeaponId[]).filter((id) => shapes.some((s) => id.endsWith(`-${s}`) && id.split("-").length === s.split("-").length + 1))
