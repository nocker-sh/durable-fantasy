// Where each resident is at each hour (game-system.md §7.5). The town works in three shifts
// (town.md「三交代」, shifts.ts): the morning shift is up at three to feed the town before dawn (flour,
// bread, porridge, milk, meat, swept streets), the day shift keeps the sun's work (timber, charcoal,
// loads from the road, the children), and the night shift, the largest, keeps the shops, the night
// market and the tavern. Everyone mostly stands still at their spot; they change places only when the
// hour comes round. Server and browser both read this, so everyone sees the same people in the same places.
import { CyclicSchedule } from "../../lib/engine/cyclic-schedule"
import { INTERIORS, keeperPlace, seatsOf, type Cell } from "./interiors.ts"

/** A spot: a named place on a map (scene `places`, exported to the map JSON), a tile position, or a cell. */
export type Spot = { map: string; place: string } | { map: string; tile: readonly [number, number] } | { map: string; cell: Cell }
/** Where someone is in a stretch of the day: at work, somewhere else, or at home out of sight. */
export type Where = "work" | "home" | "tavern" | "inn" | Spot
export interface Slot {
  from: number
  where: Where
  doing: string
}

const t = (s: string) => {
  const [h, m] = s.split(":").map(Number)
  return h * 60 + m
}
const at = (from: string, where: Where, doing: string): Slot => ({ from: t(from), where, doing })
const P = (map: string, place: string): Spot => ({ map, place })

/** Each resident's day, slots in order round the clock (the last runs on into the first). */
export const ROUTINES: Record<string, readonly Slot[]> = {
  // ---------------------------------------------------------------- the square
  ギュンター: [at("07:30", "home", "眠る"), at("16:00", "work", "鉄を打つ"), at("04:30", "tavern", "一杯やる")],
  ペーター: [at("08:00", "home", "眠る"), at("16:30", "work", "炉の番"), at("02:30", P("phanthiet", "well2"), "炉の水を汲みに出る"), at("03:30", "work", "炉の番")],
  マルタ: [
    at("02:30", P("phanthiet", "oven"), "窯を焚いてパンを焼く"),
    at("06:00", "work", "焼きたてを売る"),
    at("08:30", P("phanthiet", "oven"), "二度目の窯"),
    at("09:30", "work", "焼きたてを売る"),
    at("10:30", P("phanthiet", "oven"), "窯の火を落とす"),
    at("11:00", "home", "家のことをして眠る"),
  ],
  ハンス: [
    at("06:00", "work", "店先でパンを売る"),
    at("10:30", "home", "眠る"),
    at("16:00", "home", "起きて窯の支度を手伝う"),
    at("17:00", "work", "店先で夜市の客にパンを売る"),
    at("01:30", "home", "眠る"),
  ],
  リーゼル: [
    at("14:30", "home", "起きて母の手伝い"),
    at("16:00", "work", "井戸の水を運ぶ"),
    at("17:00", P("phanthiet", "well2"), "井戸端で湯を売る"),
    at("22:00", "work", "夜明かしの家へ水を運ぶ"),
    at("02:30", "home", "眠る"),
  ],
  アンナ: [at("14:30", "work", "日のあるうちに洗う"), at("16:00", "home", "洗濯物を室内の縄に干す"), at("17:00", "home", "繕い物"), at("19:00", "tavern", "妹と一杯"), at("20:30", "home", "眠る")],
  クララ: [at("14:30", "work", "日のあるうちに洗う"), at("17:00", "home", "洗濯物を室内の縄に干す"), at("17:30", "home", "夕餉の支度"), at("20:30", "home", "眠る")],
  エルザ: [
    at("12:30", { map: "phanthiet", tile: [16.6, 27.9] }, "夫の店じまいを手伝う"),
    at("13:30", "home", "起きて油を温める"),
    at("14:30", "work", "日のあるうちに洗う"),
    at("16:00", "home", "洗濯物を室内の縄に干す"),
    at("16:30", P("phanthiet-market", "nm1"), "夜市で揚げ菓子を売る"),
    at("19:30", "home", "眠る"),
  ],
  オットー: [at("08:00", "home", "眠る"), at("16:30", "work", "夜市で果物を売る"), at("02:00", "tavern", "一杯やる"), at("03:30", "work", "夜明け前の客に売る")],
  グレーテ: [at("08:00", "home", "眠る"), at("17:00", "work", "夜市で野菜を売る"), at("01:30", P("phanthiet", "s3b"), "広場で姉と夜食"), at("02:30", "work", "夜市で野菜を売る")],
  ヤコブ: [at("04:00", P("net-sheds", "netRack"), "浜で網を揚げる"), at("08:30", "work", "魚を売る"), at("13:30", "home", "眠る")],
  // the children stay out until the light goes, long enough to see Peter come to the forge and Dieter start his round
  フリッツ: [
    at("12:00", "home", "起きて家の手伝い"),
    at("13:00", "work", "日なたで遊ぶ"),
    at("17:00", { map: "phanthiet", cell: [36, 44] }, "夜市の灯りの下で遊ぶ"),
    at("20:30", "home", "家に帰る"),
    at("21:30", "home", "眠る"),
  ],
  ミア: [
    at("12:00", "home", "起きて家の手伝い"),
    at("13:00", "work", "日なたで遊ぶ"),
    at("17:00", { map: "phanthiet", cell: [37, 46] }, "夜市の灯りの下で遊ぶ"),
    at("20:30", "home", "家に帰る"),
    at("21:30", "home", "眠る"),
  ],
  ヴィルヘルム: [at("11:00", "home", "起きて茶を淹れる"), at("14:30", "work", "日なたのベンチで休む"), at("16:30", "home", "昼寝"), at("18:00", "inn", "宿の暖炉で話す"), at("21:00", "home", "眠る")],
  ゲルダ: [
    at("07:30", "home", "眠る"),
    at("14:30", "work", "宿を切り盛りする"),
    at("22:30", { map: "phanthiet", cell: [51, 55] }, "宿の前を掃いて灯りを足す"),
    at("23:00", "work", "宿を切り盛りする"),
  ],
  ヨーゼフ: [at("09:00", P("forest-edge", "kiln"), "炭焼き窯の番と木を伐る"), at("13:00", "work", "薪を割って、薪と炭を売る"), at("16:30", "tavern", "一杯やる"), at("18:00", "home", "眠る")],
  ウルリケ: [
    at("06:00", P("phanthiet", "s4"), "朝市で卵と乳を売る"),
    at("08:00", "work", "鶏と豚の世話"),
    at("15:00", "home", "家のこと"),
    at("16:00", P("phanthiet-market", "nm2"), "夜市で焼き芋を売る"),
    at("20:00", "home", "家のこと"),
    at("21:00", "home", "眠る"),
  ],
  カール: [
    at("07:00", "home", "朝の支度"),
    at("09:30", "work", "畑仕事"),
    at("15:30", "home", "家のこと"),
    at("16:00", P("phanthiet-market", "nm3"), "夜市で栗を焼いて売る"),
    at("20:00", "home", "家のこと"),
    at("21:00", "home", "眠る"),
  ],
  マティアス: [at("05:00", "home", "羊の乳を搾る"), at("09:30", "work", "羊を放す"), at("16:00", "home", "羊を小屋へ入れる"), at("18:00", "home", "眠る")],
  // the monk takes his supper by the inn's fire with Wilhelm, then keeps the chapel door through the night
  ベネディクト: [
    at("07:00", "home", "眠る"),
    at("15:00", "home", "粥を炊き、薬を煎じる"),
    at("17:00", "work", "礼拝堂の戸口に立つ"),
    at("18:30", "inn", "宿で夕餉"),
    at("19:30", "work", "礼拝堂の戸口に立つ"),
    at("03:00", P("phanthiet", "graveyard"), "墓地を見回って祈る"),
    at("04:00", "work", "礼拝堂の戸口に立つ"),
  ],
  ディーター: [at("09:30", "home", "眠る"), at("16:30", "work", "夜番で広場を見回る")],
  ゾフィー: [
    at("10:30", "home", "祖父の世話"),
    at("14:00", "work", "菜園の手入れ"),
    at("16:30", "home", "祖父の世話"),
    at("17:00", P("phanthiet-market", "nm4"), "夜市で花を売る"),
    at("20:00", "home", "祖父の世話"),
    at("23:00", "home", "眠る"),
  ],
  ベルタ: [
    at("08:00", "home", "眠る"),
    at("16:00", "home", "機を織る"),
    at("17:30", "work", "夜市で買い物"),
    at("19:30", "home", "古着を背負う"),
    at("20:00", P("phanthiet-market", "nm1"), "夜市で古着を売る"),
    at("23:00", "home", "機を織る"),
  ],
  ルカス: [
    at("09:00", "work", "魚と荷を受け取る"),
    at("11:00", P("phanthiet-market", "nm3"), "外の品を並べて売る"),
    at("14:00", "home", "荷を運びに出る（町の外）"),
    at("20:00", P("phanthiet-market", "marketWell"), "ベルタの古着の店を手伝う"),
    at("22:00", "tavern", "一杯やる"),
    at("23:00", "home", "眠る"),
  ],
  ヘレナ: [at("09:30", "work", "道具屋の昼番"), at("16:00", "home", "繕い物"), at("17:00", P("phanthiet", "s2b"), "夜市で買い物"), at("18:30", "home", "眠る")],
  // ---------------------------------------------------------------- the shopping street
  フランツ: [
    at("08:00", "home", "眠る"),
    at("15:00", "work", "酒場を開ける"),
    at("03:00", { map: "phanthiet-market", tile: [6.2, 16.6] }, "酒場の裏で樽を入れ替える"),
    at("04:00", "work", "酒場を開ける"),
  ],
  // herbs picked on the meadow while it is light; before opening, a cup at the inn with Gerda, who learnt her potions from her
  イルムガルト: [at("07:00", "home", "眠る"), at("13:30", { map: "south-meadow", cell: [32, 66] }, "薬草を摘む"), at("15:00", "inn", "宿で一服"), at("16:00", "work", "薬を売る")],
  // the two shifts overlap for half an hour, to hand over the till and the book
  ブルーノ: [at("08:00", "home", "眠る"), at("15:30", "work", "道具屋の夜番"), at("01:00", { map: "phanthiet-market", tile: [17.2, 23.4] }, "店の前の灰を掃く"), at("01:30", "work", "道具屋の夜番")],
  // a bunch of Sophie's flowers on the way back from supper; a last cup with Beatrix before bed
  マグダレーナ: [
    at("05:30", "tavern", "ベアトリクスと一杯"),
    at("07:30", "home", "眠る"),
    at("15:30", "work", "仕立てて売る"),
    at("19:30", P("phanthiet-market", "marketWell"), "ゾフィーの花を買いに出る"),
    at("20:00", "work", "仕立てて売る"),
  ],
  コンスタンティン: [
    at("08:00", "home", "眠る"),
    at("17:00", P("phanthiet-market", "h-m2"), "通りの様子を見て歩く"),
    at("18:00", "work", "結晶を売る"),
    at("03:00", P("phanthiet-market", "h-m2"), "夜更けの通りを見て歩く"),
    at("04:00", "work", "結晶を売る"),
  ],
  ラインホルト: [
    at("00:30", "tavern", "ルドルフと一杯"),
    at("01:30", "work", "素材を買い取る"),
    at("05:00", { map: "phanthiet-market", tile: [33.4, 25.6] }, "夜明け前の荷車を待つ"),
    at("06:00", "work", "素材を買い取る"),
    at("08:00", "home", "眠る"),
    at("16:30", "work", "素材を買い取る"),
  ],
  // ---------------------------------------------------------------- the craftsmen's lane
  ベアトリクス: [
    at("07:30", "home", "眠る"),
    at("16:00", "work", "防具を直して売る"),
    at("22:00", { map: "phanthiet-craft", cell: [33, 52] }, "共同の炉で鉄を打つ"),
    at("00:00", "work", "防具を直して売る"),
    at("05:30", "tavern", "一杯やる"),
  ],
  ゴットフリート: [at("07:30", "home", "眠る"), at("16:00", "work", "木を削って売る"), at("23:00", P("phanthiet-craft", "h-c3"), "空き家の戸を直してやる"), at("00:00", "work", "木を削って売る")],
  ルドルフ: [at("00:30", "tavern", "ラインホルトと一杯"), at("01:30", "work", "革を売る"), at("07:30", "home", "眠る"), at("15:30", "work", "革を売る")],
  // ---------------------------------------------------------------- the south gate
  // at dusk he walks up to the square to hand the town over to the night watch
  オイゲン: [at("08:00", "work", "昼番で門に立つ"), at("16:30", { map: "phanthiet", tile: [28.25, 22.75] }, "夜番に引き継ぐ"), at("17:00", "home", "眠る")],
  テオ: [at("08:00", "home", "眠る"), at("15:30", "work", "道を教える"), at("03:00", P("phanthiet-gate", "gateWell"), "井戸端で夜明かしの話"), at("04:00", "work", "道を教える")],
  // she comes out to the gate's well before opening; Teo is already at his post
  ヒルデ: [
    at("07:00", "home", "眠る"),
    at("15:30", P("phanthiet-gate", "gateWell"), "井戸端でテオと話す"),
    at("16:00", "work", "荷を預かる"),
    at("23:00", { map: "phanthiet-gate", tile: [30.5, 25.5] }, "倉庫の前の灰を掃く"),
    at("23:30", "work", "荷を預かる"),
  ],
  // ---------------------------------------------------------------- the households that grew, and the ones that moved in
  // the baker's girl carries the bread basket for her brother, plays under the night market's lights, and sees her mother's first firing
  ローザ: [
    at("03:30", "home", "眠る"),
    at("16:30", "home", "起きて兄の支度を手伝う"),
    at("17:00", "work", "店先でパンの籠を持つ"),
    at("19:30", { map: "phanthiet", cell: [38, 46] }, "夜市の灯りの下で遊ぶ"),
    at("21:00", "work", "店先でパンの籠を持つ"),
    at("02:30", { map: "phanthiet", cell: [23, 44] }, "母の窯の火を見に行く"),
  ],
  ニーナ: [at("08:30", "home", "眠る"), at("16:00", "work", "給仕をする")],
  ゼップ: [at("07:00", "home", "眠る"), at("14:00", "work", "煮込みの仕込みをする")],
  フェルディナント: [
    at("09:00", "home", "眠る"),
    at("17:00", "inn", "宿の暖炉で地図を描く"),
    at("19:00", "work", "通りを写し描く"),
    at("23:00", { map: "phanthiet-gate", tile: [26, 31] }, "門の通りを測って歩く"),
    at("01:00", { map: "phanthiet", tile: [30.5, 25.5] }, "広場を写し描く"),
    at("03:30", "work", "通りを写し描く"),
  ],
  // the farm keeps day hours; the grandmother spins at the door and helps her daughter at the stall
  ゲルトルート: [
    at("07:00", "home", "起きて火を熾す"),
    at("09:00", "work", "戸口で糸を紡ぐ"),
    at("15:00", "home", "家のこと"),
    at("16:00", { map: "phanthiet-market", tile: [21, 28.6] }, "娘の焼き芋を手伝う"),
    at("19:00", "home", "眠る"),
  ],
  ヴァルター: [
    at("06:00", "home", "朝の支度"),
    at("07:00", "work", "畑を耕す"),
    at("15:30", { map: "phanthiet", tile: [38.4, 29.9] }, "豚の世話"),
    at("17:00", "tavern", "一杯やる"),
    at("18:30", "home", "眠る"),
  ],
  クレメンス: [at("08:00", "home", "眠る"), at("15:00", "home", "粥の支度"), at("16:30", "work", "灯明を守る")],
  // the fisher's boy goes down to the beach with his father before dawn, and spends the evening in the square
  パウル: [
    at("03:30", { map: "net-sheds", tile: [20, 15] }, "父と網を揚げる"),
    at("08:30", "work", "魚を運ぶ"),
    at("13:00", "home", "眠る"),
    at("20:30", "home", "起きて夕餉"),
    at("21:30", { map: "phanthiet", cell: [40, 47] }, "広場で仲間と過ごす"),
    at("02:30", "home", "支度をする"),
  ],
  レナ: [
    at("12:00", "home", "起きて母の手伝い"),
    at("12:30", "work", "洗濯場のそばで貝殻を並べる"),
    at("17:00", { map: "phanthiet", cell: [39, 44] }, "夜市の灯りの下で遊ぶ"),
    at("20:30", "home", "家に帰る"),
    at("21:30", "home", "眠る"),
  ],
  ヨナス: [
    at("13:30", "home", "起きて家の手伝い"),
    at("14:30", { map: "phanthiet", tile: [28, 31.4] }, "母の洗濯場で遊ぶ"),
    at("17:00", "work", "父の果物を数えて並べる"),
    at("20:30", "home", "眠る"),
  ],
  エミール: [
    at("16:00", "home", "起きて母にくっつく"),
    at("17:30", { map: "phanthiet-market", tile: [16, 26.4] }, "母について夜市を歩く"),
    at("19:30", "home", "夕餉"),
    at("20:00", { map: "phanthiet-market", tile: [14.6, 27.4] }, "古着の山で遊ぶ"),
    at("22:30", "home", "眠る"),
  ],
  アウグスト: [at("08:00", "home", "眠る"), at("16:00", "work", "灯りを直す"), at("22:00", "inn", "宿で一服"), at("23:00", "work", "灯りを直す")],
  ヘートヴィヒ: [at("07:00", "home", "眠る"), at("15:30", "work", "戸口で首巻きを編む"), at("22:00", "inn", "宿で一服"), at("23:30", "work", "戸口で首巻きを編む")],
  ティム: [
    at("01:00", "home", "眠る"),
    at("15:30", "home", "起きて火屋を磨く"),
    at("16:30", "work", "祖父の横で火屋を磨く"),
    at("17:00", { map: "phanthiet", cell: [37, 47] }, "夜市の灯りの下で遊ぶ"),
    at("21:30", "work", "祖母の毛糸を巻く"),
  ],
  // ---------------------------------------------------------------- the shopping street
  リリー: [at("07:30", "home", "眠る"), at("16:00", "work", "給仕をする")],
  マックス: [
    at("08:00", "home", "眠る"),
    at("15:30", "work", "樽を仕込む"),
    at("01:00", "tavern", "一杯やる"),
    at("02:00", "work", "樽を仕込む"),
    at("03:00", { map: "phanthiet-market", tile: [7.2, 16.6] }, "酒場の裏で樽を運ぶ"),
    at("04:00", "work", "樽を仕込む"),
  ],
  エーファ: [at("06:30", "home", "眠る"), at("13:30", { map: "south-meadow", cell: [34, 67] }, "師匠と薬草を摘む"), at("15:00", "home", "薬草を干す"), at("16:00", "work", "薬を売る")],
  ロッテ: [at("07:30", "home", "眠る"), at("15:30", "work", "縫い物をする")],
  カスパー: [at("08:00", "home", "眠る"), at("16:00", "work", "荷を運び込む"), at("00:30", "tavern", "祖父と一杯"), at("01:30", "work", "荷を運び込む")],
  エーリヒ: [
    at("08:00", "home", "眠る"),
    at("16:00", "work", "手紙を代わりに書く"),
    at("20:00", { map: "phanthiet-in-h-m5", cell: [52, 47] }, "寄り合いの記録をつける"),
    at("23:00", { map: "phanthiet", tile: [11.4, 8.6] }, "礼拝堂の記録を写す"),
    at("00:00", "work", "手紙を代わりに書く"),
  ],
  マリー: [at("08:30", "home", "眠る"), at("16:30", "work", "戸口で薬草茶を売る")],
  // the children go to the letters class in the hall in the evening (the teacher, Christian)
  ハンナ: [
    at("23:00", "home", "眠る"),
    at("15:30", "home", "起きて母の手伝い"),
    at("16:30", "work", "父の横で字を習う"),
    at("21:00", { map: "phanthiet-in-h-m5", cell: [42, 45] }, "寄り合い所で字を習う"),
  ],
  アガーテ: [at("08:00", "home", "眠る"), at("16:00", "work", "ろうそくを売る")],
  ジーモン: [
    at("08:00", "home", "眠る"),
    at("16:00", "work", "灯り油を量り売りする"),
    at("22:00", { map: "phanthiet", tile: [31, 26.5] }, "広場で油を売り歩く"),
    at("01:00", { map: "phanthiet-craft", tile: [21, 21.8] }, "職人通りで油を売り歩く"),
    at("03:00", "work", "灯り油を量り売りする"),
  ],
  フェリックス: [
    at("01:30", "home", "眠る"),
    at("15:30", "home", "起きて芯を切る"),
    at("16:30", "work", "ろうそくの芯を切る"),
    at("21:00", { map: "phanthiet-in-h-m5", cell: [44, 45] }, "寄り合い所で字を習う"),
    at("23:00", "work", "ろうそくの芯を切る"),
  ],
  // ---------------------------------------------------------------- the craftsmen's lane
  ルイーゼ: [at("07:30", "home", "眠る"), at("16:00", "work", "防具を磨く"), at("22:00", { map: "phanthiet-craft", cell: [35, 52] }, "共同の炉で師匠の鎚を受ける"), at("00:00", "work", "防具を磨く")],
  アントン: [at("07:30", "home", "眠る"), at("15:30", "work", "樽を組む")],
  ハインリヒ: [at("08:00", "home", "眠る"), at("16:00", "work", "器を焼く")],
  テレーゼ: [at("08:30", "home", "眠る"), at("16:30", "work", "器に絵をつける")],
  アデーレ: [at("09:00", "home", "眠る"), at("16:30", "work", "窯の番"), at("17:30", { map: "phanthiet-market", tile: [26.6, 26.8] }, "夜市で器を売る"), at("23:00", "work", "窯の番")],
  エマ: [at("08:00", "home", "眠る"), at("16:00", "work", "籠を編む")],
  ニクラス: [at("08:00", "home", "眠る"), at("16:00", "work", "木を運ぶ"), at("23:00", { map: "phanthiet-craft", cell: [64, 48] }, "母に夜食を届ける"), at("23:30", "work", "木を運ぶ")],
  フリーダ: [
    at("01:00", "home", "眠る"),
    at("15:30", "home", "起きて柳を選る"),
    at("16:30", "work", "母の籠の柳を選る"),
    at("21:00", { map: "phanthiet-in-h-m5", cell: [46, 45] }, "寄り合い所で字を習う"),
    at("23:00", "work", "母の籠の柳を選る"),
  ],
  ローゼマリー: [at("23:00", "home", "眠る"), at("16:30", "home", "起きて茶を淹れる"), at("17:00", "work", "戸口で柳を水に浸す")],
  マルクス: [at("08:00", "home", "眠る"), at("16:00", "work", "石を割る"), at("21:00", { map: "phanthiet", tile: [21.5, 26.2] }, "広場の石畳を直す"), at("00:00", "work", "石を割る")],
  カタリーナ: [at("08:30", "home", "眠る"), at("16:30", "work", "灰をふるって灰汁を作る")],
  ダニエル: [at("01:00", "home", "眠る"), at("15:30", "home", "起きて水を汲む"), at("16:30", "work", "父の石を運ぶ")],
  イダ: [
    at("23:00", "home", "眠る"),
    at("15:30", "home", "起きて母の手伝い"),
    at("16:30", "work", "石を並べて遊ぶ"),
    at("21:00", { map: "phanthiet-in-h-m5", cell: [48, 45] }, "寄り合い所で字を習う"),
  ],
  // the sweep and his boy go round the town's chimneys: the square, then the shopping street, then home
  ベルンハルト: [
    at("08:00", "home", "眠る"),
    at("16:00", { map: "phanthiet", tile: [27, 22.6] }, "屋根の灰を下ろす"),
    at("20:00", { map: "phanthiet-market", tile: [20, 22.6] }, "煙突を掃く"),
    at("00:00", "work", "道具の手入れ"),
    at("03:00", { map: "phanthiet-gate", tile: [26.4, 14] }, "門の詰所の煙突を掃く"),
    at("05:00", "work", "道具の手入れ"),
  ],
  モニカ: [at("08:30", "home", "眠る"), at("16:30", "work", "灰を袋に詰めて売る")],
  トビアス: [
    at("02:00", "home", "眠る"),
    at("15:30", "home", "起きて腹ごしらえ"),
    at("16:00", { map: "phanthiet", tile: [27.8, 23.4] }, "親方と屋根に上がる"),
    at("20:00", { map: "phanthiet-market", tile: [21, 23] }, "細い煙突に潜る"),
    at("00:00", "work", "ぶらしの煤を落とす"),
  ],
  // ---------------------------------------------------------------- the south gate
  シュテファン: [at("07:30", { map: "phanthiet", tile: [29.5, 22.6] }, "夜明けに広場の夜番と落ち合う"), at("08:00", "home", "眠る"), at("16:00", "work", "夜番で門に立つ")],
  ヴェロニカ: [
    at("07:00", "home", "起きて支度"),
    at("07:30", { map: "phanthiet", tile: [28.6, 23.6] }, "広場で夜番から引き継ぐ"),
    at("08:00", "work", "昼番で通りを見回る"),
    at("16:30", "home", "夕餉"),
    at("17:30", "home", "眠る"),
  ],
  ゲオルク: [at("07:00", "home", "眠る"), at("15:00", "work", "荷を担いで運び込む")],
  クルト: [at("08:00", "home", "眠る"), at("16:00", "work", "鍋の穴をふさぐ"), at("23:00", { map: "phanthiet", tile: [33, 27] }, "広場で鍋を直す"), at("03:00", "work", "鍋の穴をふさぐ")],
  ザビーネ: [at("08:30", "home", "眠る"), at("16:30", "work", "刃物を研ぐ")],
  ヨハン: [
    at("23:00", "home", "眠る"),
    at("15:30", "home", "起きて手伝い"),
    at("16:30", "work", "鋳掛けの火を吹く"),
    at("21:00", { map: "phanthiet-in-h-m5", cell: [50, 45] }, "寄り合い所で字を習う"),
  ],
  リナ: [
    at("23:00", "home", "眠る"),
    at("15:30", "home", "起きて手伝い"),
    at("16:30", "work", "母の砥石に水をかける"),
    at("21:00", { map: "phanthiet-in-h-m5", cell: [52, 45] }, "寄り合い所で字を習う"),
  ],
  // the hunters keep the forest's hours: out at the traps before dawn, the skins in the afternoon
  ファルク: [
    at("03:30", { map: "forest-edge", tile: [14, 20] }, "罠を見て回る"),
    at("09:30", "work", "獲物の皮を剥ぐ"),
    at("13:00", "home", "眠る"),
    at("20:30", { map: "phanthiet-craft", tile: [24.4, 22.4] }, "ルドルフに皮を届ける"),
    at("21:30", "work", "矢を削る"),
  ],
  ブリギッテ: [at("09:00", "home", "眠る"), at("17:00", "work", "肉を燻す")],
  ロルフ: [at("03:30", { map: "forest-edge", tile: [15, 21] }, "父と罠を見て回る"), at("09:30", "work", "皮を張る"), at("13:00", "home", "眠る"), at("20:30", "work", "弓の弦を張り替える")],
  クリスティアン: [
    at("08:00", "home", "眠る"),
    at("16:00", "work", "教える支度をする"),
    at("20:30", { map: "phanthiet-in-h-m5", cell: [44, 43] }, "寄り合い所で子どもに字を教える"),
    at("23:30", "work", "書き物をする"),
  ],
  ドロテア: [at("08:00", "home", "眠る"), at("15:00", "inn", "宿でイルムガルトと一服"), at("16:00", "work", "薬湯を煎じる")],
  ラウラ: [
    at("23:00", "home", "眠る"),
    at("15:30", "home", "起きて本を読む"),
    at("16:30", "work", "弟の面倒を見る"),
    at("21:00", { map: "phanthiet-in-h-m5", cell: [42, 47] }, "寄り合い所で字を習う"),
  ],
  ベンヤミン: [
    at("23:00", "home", "眠る"),
    at("15:30", "home", "起きて木の馬で遊ぶ"),
    at("16:30", "work", "木の馬で遊ぶ"),
    at("21:00", { map: "phanthiet-in-h-m5", cell: [44, 47] }, "寄り合い所で字を習う"),
  ],
  エドガー: [at("02:00", "home", "眠る"), at("16:00", "work", "門の通りを眺める"), at("22:00", P("phanthiet-gate", "gateWell"), "井戸端で昔話"), at("23:00", "work", "門の通りを眺める")],
  マルグリット: [at("02:00", "home", "眠る"), at("17:00", "work", "戸口で編み物"), at("22:00", "inn", "宿でヘートヴィヒと編み物"), at("23:30", "work", "戸口で編み物")],
  // ---------------------------------------------------------------- the morning shift (up at 3, to bed after noon)
  // those who feed the town before dawn: flour, bread, porridge, milk, meat, the first vegetables, swept streets
  ベルトラム: [
    at("02:30", "home", "起きて粥をすする"),
    at("03:00", "work", "風車で麦を挽く"),
    at("08:00", P("phanthiet", "field"), "カールの麦を受け取る"),
    at("08:30", "work", "風車で麦を挽く"),
    at("12:30", "home", "夕餉"),
    at("13:30", "home", "眠る"),
  ],
  イルゼ: [
    at("03:00", "home", "起きて火を熾す"),
    at("04:00", "work", "粉を量って袋に詰める"),
    at("06:00", P("phanthiet", "oven"), "マルタに粉を届ける"),
    at("06:30", "work", "粉を量って袋に詰める"),
    at("12:30", "home", "夕餉の支度"),
    at("14:00", "home", "眠る"),
  ],
  クラウス: [at("03:00", "home", "起きる"), at("03:30", "work", "粉袋を担ぐ"), at("09:00", P("phanthiet", "well2"), "井戸端で町の噂を聞く"), at("10:00", "work", "粉袋を担ぐ"), at("13:00", "home", "眠る")],
  オスカー: [
    at("02:30", "home", "起きて支度"),
    at("03:30", "work", "鍬で畑を起こす"),
    at("08:00", P("phanthiet-fields", "fieldsWell"), "井戸で水を汲む"),
    at("08:30", P("phanthiet-fields", "rye"), "麦の畑を見回る"),
    at("10:30", "work", "鍬で畑を起こす"),
    at("13:00", "home", "夕餉"),
    at("14:00", "home", "眠る"),
  ],
  ヨハンナ: [
    at("03:00", "home", "起きて火を熾す"),
    at("04:00", "work", "蕪を抜く"),
    at("09:00", P("phanthiet-fields", "fieldsWell"), "井戸端で洗い物"),
    at("10:00", "work", "蕪を抜く"),
    at("12:30", "home", "夕餉の支度"),
    at("14:00", "home", "眠る"),
  ],
  ヴァレンティン: [
    at("05:00", "home", "起きて母の手伝い"),
    at("06:00", "work", "鶏を追って遊ぶ"),
    at("09:00", P("phanthiet-fields", "sties"), "バスティアンと豚を見る"),
    at("10:30", "work", "井戸のそばで遊ぶ"),
    at("15:30", "home", "夕餉"),
    at("16:30", "home", "眠る"),
  ],
  エリーゼ: [
    at("05:00", "home", "起きて手伝い"),
    at("06:00", "work", "井戸のそばで遊ぶ"),
    at("11:00", { map: "phanthiet-fields", tile: [8.2, 23.8] }, "子守りの家の前でピアと遊ぶ"),
    at("13:00", "work", "井戸のそばで遊ぶ"),
    at("15:30", "home", "夕餉"),
    at("16:30", "home", "眠る"),
  ],
  ヴェンデル: [
    at("02:30", "home", "起きて支度"),
    at("03:30", "work", "畑に水を引く"),
    at("07:30", P("phanthiet-fields", "cabbages"), "キャベツの虫を取る"),
    at("10:00", "work", "畑に水を引く"),
    at("13:00", "home", "夕餉"),
    at("14:00", "home", "眠る"),
  ],
  アグネス: [at("03:00", "home", "起きて火を熾す"), at("04:00", "work", "麦の畑の草を取る"), at("12:30", "home", "夕餉の支度"), at("13:30", "home", "眠る")],
  ルートヴィヒ: [
    at("03:00", "home", "起きる"),
    at("03:30", "work", "畝を立てる"),
    at("08:00", P("phanthiet-fields", "turnips"), "蕪の畑を手伝う"),
    at("10:00", "work", "畝を立てる"),
    at("13:00", "home", "夕餉"),
    at("14:30", "home", "眠る"),
  ],
  イルマ: [at("04:00", "home", "起きて糸を紡ぐ"), at("06:00", "work", "戸口で糸を紡ぐ"), at("14:30", "home", "夕餉の支度"), at("15:30", "home", "眠る")],
  アルブレヒト: [
    at("02:00", "home", "起きて支度"),
    at("02:30", "work", "豚を潰す"),
    at("07:00", P("phanthiet-fields", "butcherYard"), "肉を燻しにかける"),
    at("08:30", P("phanthiet-market", "marketWell"), "市場に肉を卸す"),
    at("09:30", "work", "腸詰めを作る"),
    at("12:30", "home", "夕餉"),
    at("13:30", "home", "眠る"),
  ],
  ギーゼラ: [at("03:00", "home", "起きて火を熾す"), at("04:00", "work", "肉を塩に漬ける"), at("12:30", "home", "夕餉の支度"), at("13:30", "home", "眠る")],
  バスティアン: [at("04:00", "home", "起きる"), at("04:30", "work", "豚に餌をやる"), at("09:00", P("phanthiet-fields", "sties"), "豚を見回る"), at("10:30", "work", "豚に餌をやる"), at("15:30", "home", "夕餉"), at("16:30", "home", "眠る")],
  レーニ: [
    at("02:30", "home", "起きる"),
    at("03:00", P("phanthiet-fields", "meadow"), "牛の乳を搾る"),
    at("06:00", "work", "バターを作る"),
    at("08:00", "work", "チーズを仕込む"),
    at("12:30", "home", "夕餉"),
    at("13:30", "home", "眠る"),
  ],
  フーゴ: [
    at("04:00", "home", "起きる"),
    at("05:00", P("phanthiet-fields", "meadow"), "牛を放す"),
    at("06:00", "work", "牛を見張る"),
    at("14:00", P("phanthiet-fields", "meadow"), "牛を小屋へ入れる"),
    at("14:30", "home", "眠る"),
  ],
  ピア: [
    at("05:00", "home", "起きる"),
    at("06:00", "work", "祖父と牛を見る"),
    at("10:00", { map: "phanthiet-fields", tile: [9.4, 23.9] }, "子守りの家の前で遊ぶ"),
    at("15:30", "home", "夕餉"),
    at("16:30", "home", "眠る"),
  ],
  オッティリエ: [at("02:00", "home", "起きて粥を煮る"), at("03:00", "work", "朝の客に粥をよそう"), at("11:30", "home", "鍋を洗う"), at("12:30", "home", "眠る")],
  ベンノ: [
    at("01:30", "home", "起きて火を熾す"),
    at("03:00", "work", "大鍋の火の番"),
    at("06:00", P("phanthiet", "oven"), "マルタのパンを受け取る"),
    at("06:30", "work", "大鍋の火の番"),
    at("11:00", "home", "眠る"),
  ],
  ユッタ: [at("02:30", "home", "起きる"), at("03:00", "work", "椀を運ぶ"), at("09:00", P("phanthiet-market", "marketWell"), "井戸で椀を洗う"), at("10:00", "work", "椀を運ぶ"), at("12:00", "home", "眠る")],
  グスタフ: [
    at("02:30", "home", "起きる"),
    at("03:00", "work", "広場を掃く"),
    at("06:00", { map: "phanthiet-market", tile: [20, 24.4] }, "市場の通りを掃く"),
    at("08:00", { map: "phanthiet-craft", tile: [22.6, 36.4] }, "モニカに集めた灰を渡す"),
    at("08:30", { map: "phanthiet-gate", tile: [24.6, 20.6] }, "門の通りを掃く"),
    at("10:00", "work", "広場を掃く"),
    at("12:30", "home", "眠る"),
  ],
  ヴィルマ: [at("03:00", "home", "起きる"), at("03:30", "work", "石畳の灰を掃く"), at("12:00", "home", "夕餉の支度"), at("13:00", "home", "眠る")],
  エリアス: [
    at("05:00", "home", "起きる"),
    at("06:00", "work", "祖母のそばで灰を集める"),
    at("09:00", P("phanthiet", "lavoir1"), "モーリッツと川を見る"),
    at("10:30", "work", "灰を集める"),
    at("12:30", P("phanthiet", "lavoir1"), "川べりで石を拾う"),
    at("15:00", "home", "夕餉"),
    at("16:00", "home", "眠る"),
  ],
  クーノ: [
    at("02:00", "home", "起きる"),
    at("02:30", "work", "川に網を入れる"),
    at("06:30", { map: "net-sheds", place: "netRack" }, "ヤコブと網を干す"),
    at("08:00", "work", "川魚を捌く"),
    at("12:00", "home", "夕餉"),
    at("13:00", "home", "眠る"),
  ],
  テーダ: [at("03:00", "home", "起きる"), at("04:00", "work", "網を繕う"), at("12:30", "home", "夕餉の支度"), at("13:30", "home", "眠る")],
  モーリッツ: [
    at("05:00", "home", "起きる"),
    at("06:00", "work", "父の魚籠を洗う"),
    at("09:00", P("phanthiet", "lavoir2"), "エリアスと川を見る"),
    at("10:30", "work", "網の浮きを数える"),
    at("12:30", P("phanthiet", "lavoir2"), "川べりで石を投げる"),
    at("15:00", "home", "夕餉"),
    at("16:00", "home", "眠る"),
  ],
  レオポルト: [at("01:30", "home", "起きる"), at("02:00", P("phanthiet", "knead"), "パン種をこねる"), at("02:30", "work", "窯の火の番"), at("10:00", "home", "眠る")],
  // the watch: three shifts, handed over at the gate and on the square
  コンラート: [at("02:30", "home", "起きて支度"), at("03:00", "work", "朝番で門に立つ"), at("13:00", "home", "夕餉"), at("14:00", "home", "眠る")],
  ヘンリケ: [
    at("08:00", "home", "起きて支度"),
    at("08:30", { map: "phanthiet-gate", tile: [22.8, 25.6] }, "門で朝番から番を受ける"),
    at("09:30", "work", "昼番で広場を見回る"),
    at("19:00", "home", "夕餉"),
    at("20:00", "home", "眠る"),
  ],
  ロータル: [
    at("04:30", "home", "眠る"),
    at("15:00", "home", "起きて支度"),
    at("16:00", { map: "phanthiet", tile: [21.6, 19.8] }, "広場で昼番から番を受ける"),
    at("16:30", "work", "夜番で通りを見回る"),
    at("03:00", { map: "phanthiet-gate", tile: [22.8, 26.6] }, "門で朝番に番を渡す"),
    at("03:30", "work", "夜番で通りを見回る"),
  ],
  // ---------------------------------------------------------------- the day shift (up at 8, to bed at 8)
  // the work that wants the sun or the forest: timber, charcoal, loads from the road, the children of the other shifts
  アンゼルム: [
    at("07:30", "home", "起きる"),
    at("08:30", "work", "木を伐る"),
    at("12:00", P("forest-edge", "kiln"), "ヨーゼフと倒す木を決める"),
    at("13:00", "work", "枝を払う"),
    at("17:30", { map: "phanthiet-craft", tile: [36, 22.6] }, "大工に丸太を届ける"),
    at("18:30", "home", "夕餉"),
    at("19:30", "home", "眠る"),
  ],
  ルーペルト: [at("07:30", "home", "起きる"), at("08:30", "work", "鋸を引く"), at("17:30", "home", "夕餉"), at("19:00", "home", "眠る")],
  フロリアン: [at("08:00", "home", "起きる"), at("09:00", "work", "丸太を転がす"), at("17:30", "home", "夕餉"), at("19:00", "home", "眠る")],
  ゼヴェリン: [at("07:00", "home", "起きる"), at("08:00", "work", "炭窯を積む"), at("17:00", "home", "夕餉"), at("18:30", "home", "眠る")],
  ヴァルトラウト: [
    at("07:00", "home", "起きて火を熾す"),
    at("09:00", "work", "炭を俵に詰める"),
    at("13:00", { map: "phanthiet-craft", tile: [18.6, 28.4] }, "鍛冶場に炭を届ける"),
    at("14:00", "work", "炭を俵に詰める"),
    at("18:00", "home", "夕餉の支度"),
    at("19:30", "home", "眠る"),
  ],
  インゴ: [
    at("07:30", "home", "起きる"),
    at("08:30", "work", "荷を担いで運び込む"),
    at("12:00", P("phanthiet-gate", "gateWell"), "井戸端で昼をとる"),
    at("13:00", "work", "荷を担ぐ"),
    at("18:30", "home", "夕餉"),
    at("19:30", "home", "眠る"),
  ],
  カルラ: [at("08:00", "home", "起きる"), at("09:00", "work", "倉庫の荷を数える"), at("18:30", "home", "夕餉"), at("19:30", "home", "眠る")],
  ベルント: [at("08:00", "home", "起きる"), at("09:00", "work", "荷を担いで運び込む"), at("18:30", "home", "夕餉"), at("20:00", "home", "眠る")],
  アンネリー: [
    at("07:30", "home", "起きる"),
    at("08:30", "work", "子どもたちを預かる"),
    at("17:00", { map: "phanthiet-gate", tile: [11.8, 23.2] }, "クリスティアンの読み書きの手伝い"),
    at("18:30", "home", "夕餉"),
    at("19:30", "home", "眠る"),
  ],
  エルナ: [at("07:00", "home", "起きる"), at("09:00", "work", "赤子をあやす"), at("16:00", "home", "夕餉の支度"), at("18:00", "home", "眠る")],
  ヘルタ: [
    at("05:30", "home", "起きて下宿人の粥を煮る"),
    at("08:00", P("phanthiet", "oven"), "レオポルトから焼きたてを受け取る"),
    at("09:00", "work", "戸口で豆を剥く"),
    at("17:30", "home", "夕餉の支度"),
    at("20:00", "home", "眠る"),
  ],
  キリアン: [
    at("08:00", "home", "起きる"),
    at("09:00", "work", "道具屋の店先で品を並べる"),
    at("15:30", { map: "phanthiet-in-general", cell: [49, 50] }, "親方に店を渡す"),
    at("16:00", "work", "店先で品を並べる"),
    at("19:00", "home", "夕餉"),
    at("20:00", "home", "眠る"),
  ],
  ヴィープケ: [
    at("08:00", "home", "起きる"),
    at("09:00", "work", "薬屋の店先で薬草を干す"),
    at("15:00", "inn", "宿でイルムガルトと一服"),
    at("16:00", "work", "薬草を刻む"),
    at("19:00", "home", "夕餉"),
    at("20:00", "home", "眠る"),
  ],
  ネーレ: [
    at("08:00", "home", "起きる"),
    at("09:00", "work", "仕立て屋の店先で裾をかがる"),
    at("15:30", { map: "phanthiet-in-tailor", cell: [50, 50] }, "親方に縫い目を見てもらう"),
    at("16:00", "work", "裾をかがる"),
    at("19:00", "home", "夕餉"),
    at("20:00", "home", "眠る"),
  ],
  レージ: [at("07:00", "home", "起きて乳搾りを手伝う"), at("09:30", "work", "羊を数える"), at("16:00", "home", "夕餉"), at("17:30", "home", "眠る")],
  フォルカー: [at("06:30", "home", "起きる"), at("07:30", "work", "梁を刻む"), at("18:00", "home", "夕餉"), at("19:30", "home", "眠る")],
  ジビレ: [at("07:00", "home", "起きる"), at("08:30", "work", "木屑を集める"), at("17:30", "home", "夕餉の支度"), at("20:00", "home", "眠る")],
  ウルリヒ: [at("07:00", "home", "起きる"), at("07:30", "work", "鉋をかける"), at("18:00", "home", "夕餉"), at("19:00", "home", "眠る")],
  パウリーネ: [
    at("08:00", "home", "起きる"),
    at("09:00", "work", "木切れで遊ぶ"),
    at("16:30", { map: "phanthiet-market", tile: [27.2, 31.4] }, "屋台のそばでリヌスと遊ぶ"),
    at("18:00", "home", "夕餉"),
    at("19:00", "home", "眠る"),
  ],
  エルヴィン: [
    at("07:00", "home", "起きる"),
    at("09:00", "work", "日なたで木を削る"),
    at("13:00", { map: "phanthiet-craft", tile: [37.2, 22.4] }, "フォルカーの仕事を覗く"),
    at("14:00", "work", "日なたで座る"),
    at("17:00", "home", "夕餉"),
    at("18:30", "home", "眠る"),
  ],
  アーデルハイト: [
    at("07:00", "home", "起きる"),
    at("09:30", "work", "日なたで繕い物"),
    at("17:00", { map: "phanthiet-gate", tile: [29.4, 36.2] }, "マルグリットと編み物"),
    at("18:30", "home", "夕餉"),
    at("19:30", "home", "眠る"),
  ],
  // ---------------------------------------------------------------- the night shift, newly come
  ティル: [at("05:00", "home", "眠る"), at("15:00", "home", "起きる"), at("16:00", "work", "夜の窯の番")],
  ドミニク: [at("04:00", "home", "眠る"), at("14:00", "home", "起きて骨を煮る"), at("16:30", "work", "夜市で汁を売る")],
  レア: [at("04:30", "home", "眠る"), at("14:30", "home", "起きて野菜を刻む"), at("17:00", "work", "汁をよそう")],
  リヌス: [at("01:00", "home", "眠る"), at("14:30", "home", "起きる"), at("15:30", "work", "屋台の椀を並べる")],
}

const schedules = new Map(Object.entries(ROUTINES).map(([name, slots]) => [name, new CyclicSchedule(slots)]))

/** The slot someone is in at `min`; definitions are sorted once when loaded. */
export function slotAt(name: string, min: number): Slot | null {
  return schedules.get(name)?.at(min) ?? null
}

/** The people who drink at a place, in a fixed order, so each has their own seat. */
const PATRONS: Record<"tavern" | "inn", string[]> = {
  tavern: Object.entries(ROUTINES)
    .filter(([, d]) => d.some((s) => s.where === "tavern"))
    .map(([n]) => n),
  inn: Object.entries(ROUTINES)
    .filter(([, d]) => d.some((s) => s.where === "inn"))
    .map(([n]) => n),
}

/**
 * Where someone stands at `min`: a spot, or null when they are at home out of sight. `work` is
 * their usual spot (residents.ts, with shopkeepers behind their counters).
 */
export function spotAt(name: string, min: number, work: Spot): Spot | null {
  const s = slotAt(name, min)
  if (!s || s.where === "home") return null
  if (s.where === "work") return work
  if (s.where === "tavern" || s.where === "inn") {
    const it = INTERIORS.find((i) => i.house.id === s.where)
    if (!it) return null
    const seats = seatsOf(it)
    // the seats go round those who are there at this hour, in a fixed order
    const here = PATRONS[s.where].filter((n) => slotAt(n, min)?.where === s.where)
    const k = here.indexOf(name)
    return seats.length && k >= 0 ? { map: it.id, cell: seats[k % seats.length] } : null
  }
  return s.where
}

/** A resident's work spot from their entry in residents.ts. */
export function workSpot(r: { name: string; map?: string; at: string | readonly [number, number] }): Spot {
  const keeper = keeperPlace(r.name)
  if (keeper) return { map: keeper.map, cell: keeper.cell }
  const map = r.map ?? "phanthiet"
  return typeof r.at === "string" ? { map, place: r.at } : { map, tile: r.at }
}
