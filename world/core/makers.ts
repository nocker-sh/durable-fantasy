// Who makes what, and how their things turn out (game-system.md §4.2.1). A made thing carries its
// maker's name ("イルムガルトの回復薬") and a quality; the maker's hand shows in how the qualities
// fall, how it works, what it costs and what is said of it. Players' things use the plain recipe.
import { ITEMS, QUALITY_EFFECT, QUALITY_PRICE, type ItemIcon, type ItemId, type Quality } from "./items.ts"

export interface Trait {
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

const ordinary = [0, 1, 0, 0] as const
const steady = [0.05, 0.65, 0.28, 0.02] as const
const homely = [0.35, 0.4, 0.17, 0.08] as const
const plain = [0.2, 0.7, 0.1, 0] as const

export const MAKERS: Record<string, Partial<Record<ItemId, Trait>>> = {
  イルムガルト: {
    "blue-potion": { tiers: ordinary, note: "イルムガルトが青い葉を煮詰め、ゼリーでまとめた水薬。" },
    "orange-potion": { tiers: ordinary, note: "イルムガルトが蜜を合わせ、苦みを和らげた水薬。" },
    potion: { tiers: steady, effect: 1.05, price: 1.1, note: "薬師イルムガルトの手。苦いが、すぐ効く。出来はいつも揃っている。", icon: "potionR" },
    "herb-tea": { tiers: steady, sp: 4, note: "喉が弱い人にと、イルムガルトが勧める。", icon: "cupTea" },
  },
  ゲルダ: {
    potion: { tiers: homely, effect: 0.95, warm: 20, price: 0.85, note: "宿のおかみの手作り。出来にむらがあるが、飲むと腹の底が温まる。", icon: "potionA" },
    stew: { tiers: homely, warm: 10, note: "ゲルダの宿の名物。日によって味が違う、と常連は言う。" },
    "mushroom-soup": { tiers: homely, note: "ヨーゼフが届けたきのこで作る。" },
    "mushroom-stew": { tiers: homely, note: "余った黒パンを無駄にしない、宿の知恵。" },
    "cabbage-soup": { tiers: homely, note: "おかわりは、と聞かれる。" },
  },
  ベネディクト: {
    charm: { tiers: ordinary, note: "ベネディクトが木を削り、毛糸を通して祈りを込めたお守り。" },
    potion: { tiers: [0.1, 0.5, 0.3, 0.1], effect: 0.9, sp: 10, price: 1.25, note: "修道士が祈りの言葉と一緒に煎じた。HP より SP に効く。量は少ない。", icon: "potionP" },
    porridge: { tiers: [0.6, 0.4, 0, 0], price: 1, note: "寄り合いの寄進で炊いている。一椀二枚、足りなければあとでいい。" },
  },
  マルタ: {
    "rye-bread": { tiers: steady, note: "夜中から窯を焚くマルタの黒パン。焼き上がりの時刻に並ぶ人がいる。" },
    roll: { tiers: steady, note: "朝いちばんに売り切れる。" },
    "apple-pie": { tiers: [0.1, 0.5, 0.3, 0.1], warm: 5, note: "オットーのりんごで焼く。" },
    "honey-cake": { tiers: steady, note: "ウルリケの巣箱の蜜を使う。" },
  },
  ギュンター: {
    "short-sword": { tiers: ordinary, note: "ギュンターが刃を鍛え、木の柄に革を巻いた片手剣。" },
    dagger: { tiers: ordinary, note: "ギュンターが鍛えた短い刃。手入れしやすい形にしてある。" },
    "iron-sword": { tiers: ordinary, note: "ギュンターの炉で鍛え、重心を確かめた剣。" },
    "hand-axe": { tiers: ordinary, note: "ギュンターが木の柄に刃を据えた。薪仕事にも使う。" },
    "battle-axe": { tiers: ordinary, note: "ギュンターが大きな刃を鍛え、両手用の柄を革で巻いて握りを補強した。" },
    spear: { tiers: ordinary, note: "ゴットフリートの木の柄に、ギュンターが穂先を付けた。" },
    mace: { tiers: ordinary, note: "ギュンターが鉄の頭を打ち、柄に留めた。" },
    "wood-axe": { tiers: [0.05, 0.6, 0.3, 0.05], note: "鍛冶屋は町でうちだけだ、と打った本人が言う。" },
    sickle: { tiers: [0.1, 0.7, 0.2, 0], note: "見習いのペーターが研いだ物も混じっている。" },
  },
  ゴットフリート: {
    "oak-staff": { tiers: ordinary, note: "ゴットフリートが樫を削り、先に結晶をはめた杖。" },
    "fishing-rod": { tiers: [0, 0.5, 0.4, 0.1], note: "寒い冬に切った竹のように締まった木で削った。" },
    "wooden-stick": { tiers: ordinary, note: "ゴットフリートが枝を選び、握るところを削った。" },
    "short-bow": { tiers: ordinary, note: "ゴットフリートが木のしなりを確かめて削った弓。" },
    "wooden-shield": { tiers: ordinary, note: "ゴットフリートが板を合わせた盾。金具は鍛冶場から。" },
  },
  マグダレーナ: {
    "traveller-coat": { tiers: ordinary, note: "マグダレーナが毛糸を織り、冬毛を当てて仕立てた旅の上着。" },
    "fur-stole": { tiers: ordinary, note: "マグダレーナが冬毛を寄せ、毛糸で肩掛けに仕立てた。" },
    "cloth-hat": { tiers: ordinary, note: "マグダレーナが織った布を縫い合わせた帽子。縁を折り返して丈夫にした。" },
    "wool-muffler": { tiers: ordinary, note: "マティアスの羊の毛を、マグダレーナが紡いで織った。" },
    "striped-muffler": { tiers: ordinary, note: "マグダレーナが色糸を替えながら織った首巻き。" },
    "wool-cape": { tiers: ordinary, note: "マグダレーナが裾まで目を揃えて織った外套。" },
  },
  ベアトリクス: {
    "iron-helm": { tiers: ordinary, note: "ベアトリクスが鉄を打って形を整え、内側に革を当てた兜。" },
    "chain-mail": { tiers: steady, note: "ベアトリクスが鉄の輪を一つずつ留め、継ぎ目を確かめた鎖帷子。" },
  },
  ルドルフ: {
    "leather-boots": { tiers: steady, note: "ルドルフがなめし革を裁ち、底を重ねて縫った靴。" },
    "leather-armor": { tiers: steady, note: "ルドルフがなめした革を重ね、丈夫な糸で縫った鎧。" },
    "fang-charm": { tiers: ordinary, note: "森で集めた牙をルドルフが磨き、毛糸で結んだ。" },
  },
  マティアス: {
    cheese: { tiers: plain, note: "羊飼いが小屋で寝かせたチーズ。" },
    "hot-milk": { tiers: plain, note: "朝に搾った羊の乳を温めた。" },
  },
  フランツ: {
    wine: { tiers: [0.15, 0.55, 0.25, 0.05], note: "醸造所でフランツが仕込んだ。年によって出来が違う。" },
    "hot-wine": { tiers: [0.15, 0.55, 0.25, 0.05], warm: 10, note: "酒場で温めて出す。香辛料はブルーノの店から。" },
    "cheese-toast": { tiers: plain, note: "酒場のつまみ。炉の火で炙る。" },
    "fish-soup": { tiers: plain, note: "浜の魚の骨でだしをとった。ヤコブの網の魚。" },
  },
  エルザ: { "fried-dough": { tiers: homely, note: "魚屋のおかみの揚げ菓子。蜜の量はその日の気分。" } },
  ウルリケ: { "baked-potato": { tiers: plain, warm: 5, note: "畑の芋を灰の中で焼いた。皮まで食べられる。" } },
  カール: { "roast-chestnuts": { tiers: plain, note: "樹海の入り口で拾った栗。" } },
  リーゼル: { "hot-water": { tiers: [0, 1, 0, 0], note: "井戸の水を、母と沸かした。" } },
  オットー: { "dried-apple": { tiers: plain, note: "売れ残ったりんごを干した。オットーは捨てない。" } },
  ヤコブ: { "smoked-fish": { tiers: plain, note: "浜の台で干した。潮の匂いがする。" } },
  グレーテ: { pickles: { tiers: plain, note: "姉妹で漬けた。酸っぱさは年々増している。" } },
  ブルーノ: { ration: { tiers: plain, note: "道具屋の奥で固く焼いた。味は二の次。" } },
}

/** The maker whose thing it usually is, for made things that come with no name attached. */
export function usualMaker(item: ItemId): string {
  for (const [name, things] of Object.entries(MAKERS)) if (things[item]) return name
  return "町の人"
}

export const traitOf = (item: ItemId, by: string | undefined): Trait | undefined => (by ? MAKERS[by]?.[item] : undefined)

/** "イルムガルトの回復薬", or the plain name for things nobody in particular made. */
export function displayName(item: ItemId, by?: string): string {
  return ITEMS[item].made && by ? `${by}の${ITEMS[item].name}` : ITEMS[item].name
}

/** What one of these does, by its quality and maker. */
export function effectOf(item: ItemId, q: Quality = 1, by?: string): { hp: number; sp: number; stamina: number; full: number; warm: number; focus: number } {
  const use = ITEMS[item].use ?? {}
  const t = traitOf(item, by)
  const k = (ITEMS[item].made ? QUALITY_EFFECT[q] : 1) * (t?.effect ?? 1)
  return {
    hp: Math.round((use.hp ?? 0) * k),
    sp: Math.round((use.sp ?? 0) * k + (t?.sp ?? 0)),
    stamina: Math.round((use.stamina ?? 0) * k + (t?.stamina ?? 0)),
    full: use.full ?? 0,
    focus: Math.round((use.focus ?? 0) * (ITEMS[item].made ? QUALITY_EFFECT[q] : 1)),
    warm: Math.round((use.warm ?? 0) * (ITEMS[item].made ? QUALITY_EFFECT[q] : 1) + (t?.warm ?? 0)),
  }
}

/** What one costs in a shop, by its quality and maker. */
export function priceOf(item: ItemId, q: Quality = 1, by?: string): number {
  const base = ITEMS[item].price
  if (!ITEMS[item].made) return base
  return Math.max(1, Math.round(base * QUALITY_PRICE[q] * (traitOf(item, by)?.price ?? 1)))
}

/** The qualities a maker's thing comes in at all. */
export function qualitiesOf(item: ItemId, by?: string): Quality[] {
  if (!ITEMS[item].made) return [1]
  const t = traitOf(item, by)
  return ([0, 1, 2, 3] as Quality[]).filter((q) => (t ? t.tiers[q] > 0 : q === 1))
}
