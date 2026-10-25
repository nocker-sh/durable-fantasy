// Shops in the town, the resident who keeps each one and what they sell (economy.md §4).
// Every shop buys anything sellable at the base price; some pay more for certain kinds.
import { sellPrice, ITEMS, type ItemId, type ItemKind } from "./items.ts";

export type ShopKind = "food" | "inn" | "weapon" | "armor" | "tools" | "medicine" | "crystal" | "tailor" | "buyer";

export interface ShopDefinition {
  name: string;
  kind: ShopKind;
  /** the map the shop stands on (world/maps) */
  map: string;
  /** Resident names that open this shop when spoken to. */
  keepers: readonly string[];
  /** Line said when the shop window opens. */
  greeting: string;
  stock: readonly ItemId[];
  /** whose made things these are (game-system.md §4.2.1); the usual maker when not named */
  makers?: Partial<Record<ItemId, string>>;
  /** pays this many times the base price for these kinds */
  rates?: Partial<Record<ItemKind, number>>;
  /** a street seller's pitch: open only while the seller stands there (town/routines.ts) */
  at?: { map: string; place: string };
}

export const SHOP_KIND_NAME: Record<ShopKind, string> = {
  food: "食料品",
  inn: "宿・食堂",
  weapon: "武器",
  armor: "防具",
  tools: "道具・雑貨",
  medicine: "薬",
  crystal: "結晶",
  tailor: "仕立て",
  buyer: "買取",
};

export const SHOPS = {
  // ---------------------------------------------------------------- the market square (town)
  fruit: {
    name: "オットーの果物屋",
    kind: "food",
    map: "phanthiet",
    keepers: ["オットー"],
    greeting: "蔵で寝かせた果物は甘いよ。",
    stock: ["apple", "green-apple", "pear", "plum", "grape", "dried-apple"],
  },
  vegetables: {
    name: "グレーテの八百屋",
    kind: "food",
    map: "phanthiet",
    keepers: ["グレーテ"],
    greeting: "カールさんの畑の野菜は甘いのよ。",
    stock: ["cabbage", "carrot", "turnip", "onion", "pickles"],
  },
  fish: {
    name: "ヤコブの魚屋",
    kind: "food",
    map: "phanthiet",
    keepers: ["ヤコブ"],
    greeting: "川のものも、浜で揚げた海のものもあるぞ。",
    stock: ["trout", "sea-fish", "herring", "smoked-fish"],
  },
  bakery: {
    name: "マルタのパン屋",
    kind: "food",
    map: "phanthiet",
    keepers: ["マルタ", "ハンス"],
    greeting: "焼きたてよ。マティアスさんの羊のチーズもあるわ。",
    stock: ["rye-bread", "roll", "apple-pie", "honey-cake", "cheese", "porridge"],
    makers: { porridge: "ベネディクト" }, // the monk's porridge, handed out wherever someone is minding a counter
  },
  chapel: {
    name: "礼拝堂の粥",
    kind: "food",
    map: "phanthiet",
    keepers: ["ベネディクト"],
    greeting: "温かいうちにどうぞ。一椀二枚、足りなければあとで結構です。",
    stock: ["porridge"],
    makers: { porridge: "ベネディクト" },
  },
  smithy: {
    name: "ギュンターの鍛冶場",
    kind: "weapon",
    map: "phanthiet",
    keepers: ["ギュンター"],
    greeting: "腕に合うのを選びな。",
    stock: ["wood-axe", "sickle", "dagger", "short-sword", "iron-sword", "hand-axe", "battle-axe", "spear", "mace"],
  },
  inn: {
    name: "ゲルダの宿",
    kind: "inn",
    map: "phanthiet",
    keepers: ["ゲルダ", "ニーナ"],
    greeting: "温かいスープがあるよ。外は冷えたろう。",
    stock: ["stew", "mushroom-soup", "mushroom-stew", "cabbage-soup", "hot-milk", "rye-bread", "porridge", "potion"],
    makers: { potion: "ゲルダ", "rye-bread": "マルタ", porridge: "ベネディクト" },
  },
  // ---------------------------------------------------------------- the shopping street (market)
  tavern: {
    name: "フランツの酒場",
    kind: "inn",
    map: "phanthiet-market",
    keepers: ["フランツ", "リリー"],
    greeting: "何にする？温めたぶどう酒がおすすめだ。",
    stock: ["hot-wine", "wine", "cheese-toast", "fish-soup", "cheese", "smoked-fish", "pickles"],
  },
  apothecary: {
    name: "イルムガルトの薬屋",
    kind: "medicine",
    map: "phanthiet-market",
    keepers: ["イルムガルト", "エーファ"],
    greeting: "薬は多めに持っていきなさい。",
    stock: ["potion", "herb", "blue-herb", "herb-tea", "red-potion", "orange-potion", "blue-potion", "white-potion"],
  },
  general: {
    name: "ブルーノの道具屋",
    kind: "tools",
    map: "phanthiet-market",
    keepers: ["ブルーノ", "ヘレナ"], // the night and the day shift
    greeting: "旅支度ならおまかせを。",
    stock: ["potion", "ration", "porridge", "lamp-oil", "herb", "wooden-stick", "cloth-hat", "leather-boots", "traveller-coat"],
    makers: { potion: "ベネディクト", porridge: "ベネディクト" }, // the monk's, sold for the chapel
  },
  tailor: {
    name: "マグダレーナの仕立て屋",
    kind: "tailor",
    map: "phanthiet-market",
    keepers: ["マグダレーナ", "ロッテ"],
    greeting: "寒さに負けない服を仕立てていますよ。",
    stock: ["wool-muffler", "striped-muffler", "embroidered-scarf", "fur-stole", "traveller-coat", "wool-cape", "cloth-hat", "silver-ring"],
  },
  crystal: {
    name: "コンスタンティンの結晶屋",
    kind: "crystal",
    map: "phanthiet-market",
    keepers: ["コンスタンティン"],
    greeting: "使えば消えるものです。大事にどうぞ。",
    stock: ["small-crystal", "clear-crystal", "prayer-necklace"],
  },
  buyer: {
    name: "ラインホルトの買取所",
    kind: "buyer",
    map: "phanthiet-market",
    keepers: ["ラインホルト"],
    greeting: "素材はここが一番高く買うよ。",
    stock: [],
    rates: { material: 1.3 },
  },
  // ---------------------------------------------------------------- the craftsmen's lane (craft)
  armorer: {
    name: "ベアトリクスの防具屋",
    kind: "armor",
    map: "phanthiet-craft",
    keepers: ["ベアトリクス", "ルイーゼ"],
    greeting: "体に合わせて直してあげるよ。",
    stock: ["iron-helm", "chain-mail", "wooden-shield", "leather-boots"],
  },
  woodworker: {
    name: "ゴットフリートの木工所",
    kind: "weapon",
    map: "phanthiet-craft",
    keepers: ["ゴットフリート"],
    greeting: "いい木で作ったものしか置いてない。",
    stock: ["fishing-rod", "wooden-stick", "oak-staff", "short-bow", "wooden-shield"],
  },
  leather: {
    name: "ルドルフの革工房",
    kind: "armor",
    map: "phanthiet-craft",
    keepers: ["ルドルフ"],
    greeting: "革は手間をかけた分だけ応えるぞ。",
    stock: ["leather-armor", "leather-boots", "fang-charm"],
    rates: { material: 1.1 },
  },
  // ---------------------------------------------------------------- street sellers, at their hours (economy.md §4.6)
  "fried-dough": {
    name: "エルザの揚げ菓子",
    kind: "food",
    map: "phanthiet-market",
    keepers: ["エルザ"],
    at: { map: "phanthiet-market", place: "nm1" },
    greeting: "揚げたてよ。蜜はたっぷりかけておくわね。",
    stock: ["fried-dough"],
    makers: { "fried-dough": "エルザ" },
  },
  "old-clothes": {
    name: "ベルタの古着",
    kind: "tailor",
    map: "phanthiet-market",
    keepers: ["ベルタ"],
    at: { map: "phanthiet-market", place: "nm1" },
    greeting: "繕ってあるから、まだまだ着られるわよ。",
    stock: ["cloth-hat", "traveller-coat", "wool-cape"],
  },
  potato: {
    name: "ウルリケの焼き芋",
    kind: "food",
    map: "phanthiet-market",
    keepers: ["ウルリケ"],
    at: { map: "phanthiet-market", place: "nm2" },
    greeting: "灰の中で焼いたのよ。手を温めてから食べてね。",
    stock: ["baked-potato"],
    makers: { "baked-potato": "ウルリケ" },
  },
  chestnuts: {
    name: "カールの焼き栗",
    kind: "food",
    map: "phanthiet-market",
    keepers: ["カール"],
    at: { map: "phanthiet-market", place: "nm3" },
    greeting: "森の端で拾った栗だ。はぜる音がいいだろう。",
    stock: ["roast-chestnuts"],
    makers: { "roast-chestnuts": "カール" },
  },
  peddler: {
    name: "ルカスの行商",
    kind: "tools",
    map: "phanthiet-market",
    keepers: ["ルカス"],
    at: { map: "phanthiet-market", place: "nm3" },
    greeting: "外から運んだ物と、町で預かった物だよ。次はいつ持ってこられるか分からない。",
    stock: ["blue-potion", "silver-ring", "smoked-fish", "herb-tea"],
    makers: { "herb-tea": "イルムガルト", "smoked-fish": "ヤコブ" },
  },
  flowers: {
    name: "ゾフィーの花",
    kind: "food",
    map: "phanthiet-market",
    keepers: ["ゾフィー"],
    at: { map: "phanthiet-market", place: "nm4" },
    greeting: "菜園の隅で咲いたの。窓辺に飾ってね。",
    stock: ["meadow-flower"],
  },
  "hot-water": {
    name: "リーゼルの湯売り",
    kind: "food",
    map: "phanthiet",
    keepers: ["リーゼル"],
    at: { map: "phanthiet", place: "well2" },
    greeting: "井戸の水を沸かしたの。一杯どうぞ。",
    stock: ["hot-water"],
    makers: { "hot-water": "リーゼル" },
  },
  "dawn-market": {
    name: "ウルリケの朝市",
    kind: "food",
    map: "phanthiet",
    keepers: ["ウルリケ"],
    at: { map: "phanthiet", place: "s4" },
    greeting: "産みたての卵と、マティアスの搾りたての乳よ。",
    stock: ["egg", "hot-milk"],
    makers: { "hot-milk": "マティアス" },
  },
  firewood: {
    name: "ヨーゼフの薪と炭",
    kind: "tools",
    map: "phanthiet",
    keepers: ["ヨーゼフ"],
    at: { map: "phanthiet", place: "chop" },
    greeting: "割りたての薪と、窯から出したばかりの炭だ。",
    stock: ["firewood", "charcoal", "log"],
  },
} satisfies Record<string, ShopDefinition>;

export type ShopId = keyof typeof SHOPS;

export function isShopId(value: string): value is ShopId {
  return Object.hasOwn(SHOPS, value);
}

/** The shop someone keeps; `open` picks among several (a street seller with two pitches). */
export function shopOfKeeper(name: string, open?: (shop: ShopId) => boolean): ShopId | null {
  if (open) for (const id of Object.keys(SHOPS) as ShopId[]) if ((SHOPS[id].keepers as readonly string[]).includes(name) && open(id)) return id;
  for (const id of Object.keys(SHOPS) as ShopId[]) if ((SHOPS[id].keepers as readonly string[]).includes(name)) return id;
  return null;
}

/** What this shop pays for one of the item. */
export function shopBuys(shop: ShopId, item: ItemId): number {
  const rate = (SHOPS[shop] as ShopDefinition).rates?.[ITEMS[item].kind] ?? 1;
  return Math.max(1, Math.floor(sellPrice(item) * rate));
}
