import { material } from "#/world/core/items/material"
import { craftedGear } from "#/world/core/items/crafted-gear"
import { brewedMedicine } from "#/world/core/items/brewed-medicine"
import type { ItemDefinition } from "#/world/core/items/types"

export const HUNTING_GOODS = {
  "hardened-scrap": material({ name: "厚い鉄片", price: 70, icon: "scrap", weight: 4, rarity: "fine", description: "鉄砂スライムの表面からはがれた厚い鉄片。アルノルトが刃の補強に使う。" }),
  "root-resin": material({ name: "根元の樹脂", price: 50, icon: "jellyR", rarity: "fine", description: "樹脂スライムに付いた、倒木の傷から出た樹脂。ゴットフリートが杖の継ぎに使う。" }),
  "dense-jelly": material({ name: "濃いゼリー", price: 90, icon: "jellyB", rarity: "rare", description: "古苔スライムが残す濃い粘液。イルムガルトが水薬をまとめるのに使う。" }),
  "reinforced-sword": craftedGear({
    name: "補強した鉄の剣",
    price: 900,
    icon: "sword",
    weight: 85,
    rarity: "fine",
    equip: { part: "weapon", atk: 46, delay: 1550, level: 12, needs: { str: 16, dex: 11 }, scale: { str: "C", dex: "D" } },
    description: "アルノルトが厚い鉄片を鍛え、鉄の剣の刃を補強した。",
  }),
  "tempered-sword": craftedGear({
    name: "焼入れした鉄の剣",
    price: 1900,
    icon: "sword",
    weight: 90,
    rarity: "rare",
    equip: { part: "weapon", atk: 62, delay: 1500, level: 22, needs: { str: 22, dex: 14 }, scale: { str: "C", dex: "C" } },
    description: "補強した刃を鍛え直して焼き入れた。新しい樹脂の柄巻きで手が滑りにくい。",
  }),
  "resin-staff": craftedGear({
    name: "樹脂継ぎの杖",
    price: 650,
    icon: "staff",
    weight: 50,
    rarity: "fine",
    equip: { part: "weapon", atk: 10, delay: 1600, level: 12, needs: { mnd: 10, int: 12 }, bonus: { maxSp: 35, int: 3 } },
    description: "ゴットフリートが樫の杖を樹脂で継ぎ直した。先の結晶は元の杖のもの。",
  }),
  "root-staff": craftedGear({
    name: "根巻きの杖",
    price: 1600,
    icon: "staff",
    weight: 55,
    rarity: "rare",
    equip: { part: "weapon", atk: 14, delay: 1550, level: 22, needs: { mnd: 14, int: 18 }, bonus: { maxSp: 65, int: 6 } },
    description: "樹脂継ぎの杖を、樹脂で固めた木の薄板で巻いた。結晶を支える木部がしっかりしている。",
  }),
  "forest-draught": brewedMedicine({
    name: "森の水薬",
    price: 220,
    icon: "potionG",
    use: { hp: 80, sp: 40 },
    rarity: "fine",
    description: "イルムガルトが濃いゼリーと二色の薬草を合わせた水薬。傷と疲れた頭に効く。",
  }),
} satisfies Record<string, ItemDefinition>
