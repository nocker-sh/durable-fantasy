import { houses as square } from "./houses/square.ts"
import { houses as market } from "./houses/market.ts"
import { houses as craft } from "./houses/craft.ts"
import { houses as gate } from "./houses/gate.ts"

// Households and the buildings they live and work in (.docs/town.md). Every resident belongs to
// one household; every household has one home, sized for it: one bed per member, a hearth in
// every home (the town is cold all year), a workshop or shop where the trade needs one. The
// scene builds each house from this table, so what you see outside matches what is inside.
// Homes cannot be entered; shops and public buildings open onto indoor maps.

import type { HouseDef, Household } from "./house-types.ts"
export type { HouseKind, Room, Plan, HouseDef, Household } from "./house-types.ts"

export const HOUSEHOLDS: readonly Household[] = [
  // ---------------------------------------------------------------- the market square
  {
    id: "smith",
    name: "鍛冶屋のギュンターと見習い",
    members: ["ギュンター", "ペーター"],
    living: "ふつう",
    trade: "鍛冶。炭は木こりのヨーゼフが焼き、鉄はラインホルトが買い取る古い鉄くずと鍋から。大物を打つときだけ職人通りの共同の炉を借りる",
  },
  { id: "bakers", name: "パン屋のマルタとハンス", members: ["マルタ", "ハンス", "ローザ"], living: "ふつう", trade: "パン焼き。粉は風車、薪は木こりから" },
  { id: "inn", name: "宿のゲルダとニーナ", members: ["ゲルダ", "ニーナ", "ゼップ"], living: "ふつう", trade: "宿と食堂。野菜と魚は市場から。娘のニーナが給仕、ゼップが台所" },
  {
    id: "farm",
    name: "農家のカールとウルリケ",
    members: ["カール", "ウルリケ", "フリッツ", "ミア", "ゲルトルート", "ヴァルター"],
    living: "慎ましい",
    trade: "ライ麦と小麦、キャベツ、芋、鶏と豚、巣箱の蜜。麦はカールが風車で挽いて粉にする。町の食料の出どころ",
  },
  { id: "shepherd", name: "羊飼いのマティアス", members: ["マティアス"], living: "慎ましい", trade: "羊の毛と乳とチーズ。毛は仕立て屋とベルタへ、チーズはパン屋と酒場へ" },
  { id: "woodcutter", name: "木こりのヨーゼフ", members: ["ヨーゼフ"], living: "慎ましい", trade: "薪と炭と原木。町じゅうの暖炉と炉の燃料。森のきのこを宿へ" },
  {
    id: "priest",
    name: "修道士ベネディクトと見習い",
    members: ["ベネディクト", "クレメンス"],
    living: "慎ましい",
    trade: "礼拝堂の務めと治癒、祈りの首飾りを彫る。寄り合いの寄進で粥を炊き、回復薬を煎じて道具屋に預ける。暮らしは寄り合いの寄進と治癒のお礼で立てる",
  },
  {
    id: "fisher",
    name: "魚屋のヤコブとエルザ",
    members: ["ヤコブ", "エルザ", "パウル", "レナ"],
    living: "ふつう",
    trade: "川の漁と、浜の網小屋での海の漁と魚屋。エルザは洗濯の仕事。息子のパウルが網を手伝う",
  },
  { id: "greengrocer", name: "八百屋のグレーテとアンナ", members: ["グレーテ", "アンナ"], living: "ふつう", trade: "野菜の店（キャベツはカールの畑、根菜は町の菜園から）と洗濯の仕事（姉妹）" },
  {
    id: "fruit",
    name: "果物屋のオットーとクララ",
    members: ["オットー", "クララ", "ヨナス"],
    living: "ふつう",
    trade: "南門の外の果樹園（りんご・梨・すもも・ぶどう）と果物の店。ぶどうはフランツへ。クララは洗濯の仕事",
  },
  { id: "elder", name: "ヴィルヘルムと孫娘のゾフィー", members: ["ヴィルヘルム", "ゾフィー"], living: "ゆとりがある", trade: "隠居と庭仕事。暮らしは空き家の貸し賃で立てる" },
  { id: "well", name: "ヘレナと娘のリーゼル", members: ["ヘレナ", "リーゼル"], living: "慎ましい", trade: "ヘレナは繕い物、リーゼルは水汲み" },
  { id: "carter", name: "ルカスとベルタ", members: ["ルカス", "ベルタ", "エミール"], living: "ふつう", trade: "荷運びと機織り" },
  {
    id: "lamp",
    name: "灯り直しのアウグスト",
    members: ["アウグスト", "ヘートヴィヒ", "ティム"],
    living: "慎ましい",
    trade: "手提げの灯りと燭台の修理（油はジーモン、芯はアガーテから）と、首巻きの編み物。孫のティムを育てている",
  },
  // ---------------------------------------------------------------- the shopping street
  {
    id: "tavern",
    name: "酒場のフランツ",
    members: ["フランツ", "リリー", "マックス"],
    living: "ゆとりがある",
    trade: "酒場。酒は醸造所で自分で仕込む。給仕のリリーと、醸造の手伝いのマックスが住み込み",
  },
  { id: "apothecary", name: "薬師イルムガルト", members: ["イルムガルト", "エーファ"], living: "ふつう", trade: "薬作り（弟子のエーファと）。薬草は自分で草原に摘みに行き、買取屋からも仕入れる" },
  { id: "general", name: "道具屋のブルーノ", members: ["ブルーノ"], living: "ふつう", trade: "道具と雑貨の店" },
  { id: "tailor", name: "仕立て屋のマグダレーナ", members: ["マグダレーナ", "ロッテ"], living: "ゆとりがある", trade: "服と首巻きの仕立て（お針子のロッテと）。毛は羊飼いから" },
  { id: "crystal", name: "結晶屋のコンスタンティン", members: ["コンスタンティン"], living: "ゆとりがある", trade: "結晶の小売り。世界樹のふもとの掘り仲間から仕入れる" },
  { id: "buyer", name: "買取屋のラインホルト", members: ["ラインホルト", "カスパー"], living: "ふつう", trade: "素材の買い取りと卸し。孫のカスパーが荷を運ぶ" },
  { id: "mapmaker", name: "地図描きのフェルディナント", members: ["フェルディナント"], living: "慎ましい", trade: "町と道の地図を描いて、寄り合いとテオに納める。ヴィルヘルムの貸家に住む" },
  {
    id: "scribe",
    name: "代書屋のエーリヒ",
    members: ["エーリヒ", "マリー", "ハンナ"],
    living: "ふつう",
    trade: "手紙と証文の代書、寄り合いの記録。マリーは戸口で薬草茶を売る（薬草はイルムガルトから）",
  },
  {
    id: "candle",
    name: "ろうそく屋のアガーテとジーモン",
    members: ["アガーテ", "ジーモン", "フェリックス"],
    living: "ふつう",
    trade: "ろうそく作り（獣脂はファルクとブリギッテ、蜜蝋はウルリケの巣箱から）と、灯り油の売り歩き",
  },
  // ---------------------------------------------------------------- the craftsmen's lane
  { id: "armorer", name: "防具屋のベアトリクス", members: ["ベアトリクス", "ルイーゼ"], living: "ふつう", trade: "防具作り（見習いのルイーゼと）。職人通りの共同の炉を使う" },
  { id: "woodworker", name: "木工師のゴットフリート", members: ["ゴットフリート", "アントン"], living: "ふつう", trade: "木工。原木は木こりから。息子のアントンは樽を組む" },
  { id: "leather", name: "革職人のルドルフ", members: ["ルドルフ"], living: "ふつう", trade: "革なめしと革細工。冬毛は買取屋から、羊の皮はマティアスから" },
  { id: "potter", name: "陶工のハインリヒ", members: ["ハインリヒ", "テレーゼ", "アデーレ"], living: "ふつう", trade: "器作り。釉薬は灰（モニカから）、薪は木こりから。アデーレが夜市で売る" },
  { id: "baskets", name: "籠編みのエマ", members: ["エマ", "ニクラス", "フリーダ", "ローゼマリー"], living: "慎ましい", trade: "籠と笊を編む（柳は川べりから）。ニクラスは木工所で働く" },
  { id: "mason", name: "石工のマルクス", members: ["マルクス", "カタリーナ", "ダニエル", "イダ"], living: "ふつう", trade: "石積みと煙突・炉の修理。カタリーナは灰をふるって灰汁を作る" },
  {
    id: "sweep",
    name: "煙突掃除のベルンハルト",
    members: ["ベルンハルト", "モニカ", "トビアス"],
    living: "慎ましい",
    trade: "煙突掃除と屋根の灰下ろし。集めた灰はモニカが陶工と畑に売る。トビアスは住み込みの弟子",
  },
  // ---------------------------------------------------------------- the south gate
  {
    id: "guards",
    name: "門の詰所（衛兵）",
    members: ["オイゲン", "ディーター", "シュテファン", "ヴェロニカ"],
    living: "ふつう",
    trade: "町の警備と、夕方の街灯点け（油は道具屋から）。給金は町の寄り合いから",
  },
  { id: "guide", name: "案内人テオ", members: ["テオ"], living: "慎ましい", trade: "道案内と荷の取り次ぎ" },
  { id: "warehouse", name: "倉庫番のヒルデ", members: ["ヒルデ", "ゲオルク"], living: "ふつう", trade: "倉庫の管理。預かり賃。夫のゲオルクが荷を担ぐ" },
  { id: "tinker", name: "鋳掛け屋のクルト", members: ["クルト", "ザビーネ", "ヨハン", "リナ"], living: "慎ましい", trade: "鍋と釜の鋳掛け、刃物研ぎ（ザビーネ）。錫はラインホルトから" },
  { id: "hunter", name: "猟師のファルク", members: ["ファルク", "ブリギッテ", "ロルフ"], living: "ふつう", trade: "森の猟。皮はルドルフへ、脂はろうそく屋へ、肉はブリギッテが燻して宿と酒場へ" },
  {
    id: "teacher",
    name: "先生のクリスティアン",
    members: ["クリスティアン", "ドロテア", "ラウラ", "ベンヤミン"],
    living: "ふつう",
    trade: "寄り合い所で子どもに読み書きを教える（給金は寄り合いから）。ドロテアは産婆",
  },
  { id: "retired", name: "エドガーとマルグリット", members: ["エドガー", "マルグリット"], living: "慎ましい", trade: "隠居。エドガーは元の門番で、寄り合いから少し出る" },
]

export const HOUSES: readonly HouseDef[] = [...square, ...market, ...craft, ...gate]

/** The household someone belongs to. */
export const householdOf = (name: string) => HOUSEHOLDS.find((h) => h.members.includes(name))

/** Floors the outside shows: the highest room's floor + 1. */
export const floorsOf = (h: HouseDef) => Math.max(...h.plan.rooms.map((r) => r.floor)) + 1

export const bedsOf = (h: HouseDef) => h.plan.rooms.reduce((n, r) => n + (r.beds ?? 0), 0)

/** Places to sit, read from the furniture: 椅子×n, a long bench seats three, a long table four a side. */
export function seatsOf(h: HouseDef): number {
  let n = 0
  for (const f of h.plan.furniture) {
    const count = Number(/×(\d+)/.exec(f)?.[1] ?? 1)
    if (f.startsWith("椅子")) n += count
    else if (/長椅子/.test(f)) n += 3 * count
    else if (/揺り椅子/.test(f)) n += count
    else if (f.startsWith("長卓")) n += 8 * count
  }
  return n
}

/** Buildings you can walk into: shops and public buildings (homes are private). */
export const enterable = (h: HouseDef) => h.kind === "shop" || h.kind === "public"
