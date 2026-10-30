import type { FurnitureKind } from "#/world/town/furniture-kinds"
const patterns: ReadonlyArray<Readonly<{ pattern: RegExp; kind: FurnitureKind }>> = [
  { pattern: /^(売り台|カウンター|帳場|鍵付きの陳列棚|大きな天秤)$/, kind: "counter" },
  { pattern: /棚$/, kind: "shelf" },
  { pattern: /^(食卓|大きな食卓|長卓|卓|地図の卓|書き物机|縫い物の台|祈祷台)$/, kind: "table" },
  { pattern: /^長椅子$/, kind: "bench" },
  { pattern: /椅子/, kind: "chair" },
  { pattern: /寝台/, kind: "bed" },
  { pattern: /^水甕$/, kind: "water-jar" },
  { pattern: /^(樽|酒樽|仕込み樽|魚桶|洗濯桶|大鍋)$/, kind: "barrel" },
  { pattern: /^荷車$/, kind: "parked-cart" },
  { pattern: /^(木箱|素材の箱|粉箱|野菜籠|果物籠|羊毛の袋|薪の山|木材|干し草|巣箱)$/, kind: "crate" },
  { pattern: /^(炉|暖炉)$/, kind: "hearth" },
  { pattern: /^(作業台|木工台|調合台|搾り台|なめし桶|台所の台|修理台)$/, kind: "workbench" },
  { pattern: /^(鎧掛け|槍立て|止まり木)$/, kind: "rack" },
  { pattern: /^機織り機$/, kind: "loom" },
  { pattern: /^ろくろ$/, kind: "potters-wheel" },
  { pattern: /^ろうの鍋$/, kind: "wax-pot" },
  { pattern: /^灰汁の桶$/, kind: "lye-tub" },
  { pattern: /^灰の袋$/, kind: "ash-sack" },
  { pattern: /^鋳掛けの道具箱$/, kind: "tinker-toolbox" },
  { pattern: /^砥石$/, kind: "whetstone" },
  { pattern: /^毛糸の籠$/, kind: "yarn-basket" },
  { pattern: /^編みかけの籠$/, kind: "unfinished-basket" },
  { pattern: /^柳の束$/, kind: "willow-bundle" },
  { pattern: /^茶の壺$/, kind: "tea-jar" },
  { pattern: /^油壺$/, kind: "oil-jar" },
  { pattern: /^釉の甕$/, kind: "glaze-jar" },
  { pattern: /^糸車$/, kind: "spinning-wheel" },
  { pattern: /^(衣装箱|金庫|長持|箪笥|洗面台)$/, kind: "chest" },
  { pattern: /^腰掛け$/, kind: "chair" },
  { pattern: /^(帽子掛け|鳥かご)$/, kind: "rack" },
  { pattern: /^(火鉢|焼き入れの桶)$/, kind: "barrel" },
  { pattern: /^(パン籠|薪入れ|薬草の籠)$/, kind: "crate" },
  { pattern: /^削り馬$/, kind: "workbench" },
  { pattern: /^階段$/, kind: "stair" },
]

/** Preserve the legacy name precedence; explicit authored kinds are resolved separately. */
export function getFurnitureKind(name: string): FurnitureKind | null {
  const baseName = name.replace(/（.+）$/, "")

  return patterns.find((entry) => entry.pattern.test(baseName))?.kind ?? null
}
