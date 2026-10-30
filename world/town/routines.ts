import { CyclicSchedule } from "#/lib/engine/cyclic-schedule"
import { INTERIORS } from "#/world/town/interiors"
import { withRoutineActivitySpot } from "#/world/town/with-routine-activity-spot"
import type { Cell } from "#/world/town/interiors"

/** A spot: a named place on a map (scene `places`, exported to the map JSON), a tile position, or a cell. */
export type Spot = { map: string; place: string } | { map: string; tile: readonly [number, number] } | { map: string; cell: Cell }

/** Where someone is in a stretch of the day: at work, somewhere else, or at home out of sight. */
export type Where = "work" | "home" | "tavern" | "inn" | Spot

export type RoutineActivity = { kind: "lesson"; role: "student" | "teacher" } | { kind: "records" }

export type Slot = {
  from: number
  where: Where
  doing: string
  activity?: RoutineActivity
}

const t = (s: string) => {
  const timeParts = s.split(":").map(Number),
    h = timeParts[0],
    m = timeParts[1]
  return h * 60 + m
}

const at = (inputProps: { from: string; where: Where; doing: string; activity?: RoutineActivity }): Slot => {
  const from = inputProps.from
  const where = inputProps.where
  const doing = inputProps.doing
  const activity = inputProps.activity
  return { from: t(from), where, doing, ...(activity ? { activity } : {}) }
}

const P = (map: string, place: string): Spot => ({ map, place })

/** Each resident's day, slots in order round the clock (the last runs on into the first). */
const baseRoutines: Record<string, readonly Slot[]> = {
  // ---------------------------------------------------------------- the square
  ギュンター: [at({ from: "07:30", where: "home", doing: "眠る" }), at({ from: "16:00", where: "work", doing: "鉄を打つ" }), at({ from: "04:30", where: "tavern", doing: "一杯やる" })],
  ペーター: [
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "16:30", where: "work", doing: "炉の番" }),
    at({ from: "02:30", where: P("phanthiet", "well2"), doing: "炉の水を汲みに出る" }),
    at({ from: "03:30", where: "work", doing: "炉の番" }),
  ],
  マルタ: [
    at({ from: "02:30", where: P("phanthiet", "oven"), doing: "窯を焚いてパンを焼く" }),
    at({ from: "06:00", where: "work", doing: "焼きたてを売る" }),
    at({ from: "08:30", where: P("phanthiet", "oven"), doing: "二度目の窯" }),
    at({ from: "09:30", where: "work", doing: "焼きたてを売る" }),
    at({ from: "10:30", where: P("phanthiet", "oven"), doing: "窯の火を落とす" }),
    at({ from: "11:00", where: "home", doing: "家のことをして眠る" }),
  ],
  ハンス: [
    at({ from: "06:00", where: "work", doing: "店先でパンを売る" }),
    at({ from: "10:30", where: "home", doing: "眠る" }),
    at({ from: "16:00", where: "home", doing: "起きて窯の支度を手伝う" }),
    at({ from: "17:00", where: "work", doing: "店先で夜市の客にパンを売る" }),
    at({ from: "01:30", where: "home", doing: "眠る" }),
  ],
  リーゼル: [
    at({ from: "14:30", where: "home", doing: "起きて母の手伝い" }),
    at({ from: "16:00", where: "work", doing: "井戸の水を運ぶ" }),
    at({ from: "17:00", where: P("phanthiet", "well2"), doing: "井戸端で湯を売る" }),
    at({ from: "22:00", where: "work", doing: "夜明かしの家へ水を運ぶ" }),
    at({ from: "02:30", where: "home", doing: "眠る" }),
  ],
  アンナ: [
    at({ from: "14:30", where: "work", doing: "日のあるうちに洗う" }),
    at({ from: "16:00", where: "home", doing: "洗濯物を室内の縄に干す" }),
    at({ from: "17:00", where: "home", doing: "繕い物" }),
    at({ from: "19:00", where: "tavern", doing: "妹と一杯" }),
    at({ from: "20:30", where: "home", doing: "眠る" }),
  ],
  クララ: [
    at({ from: "14:30", where: "work", doing: "日のあるうちに洗う" }),
    at({ from: "17:00", where: "home", doing: "洗濯物を室内の縄に干す" }),
    at({ from: "17:30", where: "home", doing: "夕餉の支度" }),
    at({ from: "20:30", where: "home", doing: "眠る" }),
  ],
  エルザ: [
    at({ from: "12:30", where: { map: "phanthiet", tile: [16.6, 27.9] }, doing: "夫の店じまいを手伝う" }),
    at({ from: "13:30", where: "home", doing: "起きて油を温める" }),
    at({ from: "14:30", where: "work", doing: "日のあるうちに洗う" }),
    at({ from: "16:00", where: "home", doing: "洗濯物を室内の縄に干す" }),
    at({ from: "16:30", where: P("phanthiet-market", "nm1"), doing: "夜市で揚げ菓子を売る" }),
    at({ from: "19:30", where: "home", doing: "眠る" }),
  ],
  オットー: [
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "16:30", where: "work", doing: "夜市で果物を売る" }),
    at({ from: "02:00", where: "tavern", doing: "一杯やる" }),
    at({ from: "03:30", where: "work", doing: "夜明け前の客に売る" }),
  ],
  グレーテ: [
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "17:00", where: "work", doing: "夜市で野菜を売る" }),
    at({ from: "01:30", where: P("phanthiet", "s3b"), doing: "広場で姉と夜食" }),
    at({ from: "02:30", where: "work", doing: "夜市で野菜を売る" }),
  ],
  ヤコブ: [
    at({ from: "04:00", where: P("net-sheds", "netRack"), doing: "浜で網を揚げる" }),
    at({ from: "08:30", where: "work", doing: "魚を売る" }),
    at({ from: "13:30", where: "home", doing: "眠る" }),
  ],
  // the children stay out until the light goes, long enough to see Peter come to the forge and Dieter start his round
  フリッツ: [
    at({ from: "12:00", where: "home", doing: "起きて家の手伝い" }),
    at({ from: "13:00", where: "work", doing: "日なたで遊ぶ" }),
    at({ from: "17:00", where: { map: "phanthiet", cell: [36, 44] }, doing: "夜市の灯りの下で遊ぶ" }),
    at({ from: "20:30", where: "home", doing: "家に帰る" }),
    at({ from: "21:30", where: "home", doing: "眠る" }),
  ],
  ミア: [
    at({ from: "12:00", where: "home", doing: "起きて家の手伝い" }),
    at({ from: "13:00", where: "work", doing: "日なたで遊ぶ" }),
    at({ from: "17:00", where: { map: "phanthiet", cell: [37, 46] }, doing: "夜市の灯りの下で遊ぶ" }),
    at({ from: "20:30", where: "home", doing: "家に帰る" }),
    at({ from: "21:30", where: "home", doing: "眠る" }),
  ],
  ヴィルヘルム: [
    at({ from: "11:00", where: "home", doing: "起きて茶を淹れる" }),
    at({ from: "14:30", where: "work", doing: "日なたのベンチで休む" }),
    at({ from: "16:30", where: "home", doing: "昼寝" }),
    at({ from: "18:00", where: "inn", doing: "宿の暖炉で話す" }),
    at({ from: "21:00", where: "home", doing: "眠る" }),
  ],
  ゲルダ: [
    at({ from: "07:30", where: "home", doing: "眠る" }),
    at({ from: "14:30", where: "work", doing: "宿を切り盛りする" }),
    at({ from: "22:30", where: { map: "phanthiet", cell: [51, 57] }, doing: "宿の前を掃いて灯りを足す" }),
    at({ from: "23:00", where: "work", doing: "宿を切り盛りする" }),
  ],
  ヨーゼフ: [
    at({ from: "09:00", where: P("forest-edge", "kiln"), doing: "炭焼き窯の番と木を伐る" }),
    at({ from: "13:00", where: "work", doing: "薪を割って、薪と炭を売る" }),
    at({ from: "16:30", where: "tavern", doing: "一杯やる" }),
    at({ from: "18:00", where: "home", doing: "眠る" }),
  ],
  ウルリケ: [
    at({ from: "06:00", where: P("phanthiet", "s4"), doing: "朝市で卵と乳を売る" }),
    at({ from: "08:00", where: "work", doing: "鶏と豚の世話" }),
    at({ from: "15:00", where: "home", doing: "家のこと" }),
    at({ from: "16:00", where: P("phanthiet-market", "nm2"), doing: "夜市で焼き芋を売る" }),
    at({ from: "20:00", where: "home", doing: "家のこと" }),
    at({ from: "21:00", where: "home", doing: "眠る" }),
  ],
  カール: [
    at({ from: "07:00", where: "home", doing: "朝の支度" }),
    at({ from: "09:30", where: "work", doing: "畑仕事" }),
    at({ from: "15:30", where: "home", doing: "家のこと" }),
    at({ from: "16:00", where: P("phanthiet-market", "nm3"), doing: "夜市で栗を焼いて売る" }),
    at({ from: "20:00", where: "home", doing: "家のこと" }),
    at({ from: "21:00", where: "home", doing: "眠る" }),
  ],
  マティアス: [
    at({ from: "05:00", where: "home", doing: "羊の乳を搾る" }),
    at({ from: "09:30", where: "work", doing: "羊を放す" }),
    at({ from: "16:00", where: "home", doing: "羊を小屋へ入れる" }),
    at({ from: "18:00", where: "home", doing: "眠る" }),
  ],
  // the monk takes his supper by the inn's fire with Wilhelm, then keeps the chapel door through the night
  ベネディクト: [
    at({ from: "07:00", where: "home", doing: "眠る" }),
    at({ from: "15:00", where: "home", doing: "粥を炊き、薬を煎じる" }),
    at({ from: "17:00", where: "work", doing: "礼拝堂の戸口に立つ" }),
    at({ from: "18:30", where: "inn", doing: "宿で夕餉" }),
    at({ from: "19:30", where: "work", doing: "礼拝堂の戸口に立つ" }),
    at({ from: "03:00", where: P("phanthiet", "graveyard"), doing: "墓地を見回って祈る" }),
    at({ from: "04:00", where: "work", doing: "礼拝堂の戸口に立つ" }),
  ],
  ディーター: [at({ from: "09:30", where: "home", doing: "眠る" }), at({ from: "16:30", where: "work", doing: "夜番で広場を見回る" })],
  ゾフィー: [
    at({ from: "10:30", where: "home", doing: "祖父の世話" }),
    at({ from: "14:00", where: "work", doing: "菜園の手入れ" }),
    at({ from: "16:30", where: "home", doing: "祖父の世話" }),
    at({ from: "17:00", where: P("phanthiet-market", "nm4"), doing: "夜市で花を売る" }),
    at({ from: "20:00", where: "home", doing: "祖父の世話" }),
    at({ from: "23:00", where: "home", doing: "眠る" }),
  ],
  ベルタ: [
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "16:00", where: "home", doing: "機を織る" }),
    at({ from: "17:30", where: "work", doing: "夜市で買い物" }),
    at({ from: "19:30", where: "home", doing: "古着を背負う" }),
    at({ from: "20:00", where: P("phanthiet-market", "nm1"), doing: "夜市で古着を売る" }),
    at({ from: "22:30", where: "home", doing: "子を寝かせる" }),
    at({ from: "23:00", where: "home", doing: "古着を繕う" }),
  ],
  ルカス: [
    at({ from: "09:00", where: "work", doing: "魚と荷を受け取る" }),
    at({ from: "11:00", where: P("phanthiet-market", "nm3"), doing: "外の品を並べて売る" }),
    at({ from: "14:00", where: "home", doing: "荷を運びに出る（町の外）" }),
    at({ from: "20:00", where: P("phanthiet-market", "marketWell"), doing: "ベルタの古着の店を手伝う" }),
    at({ from: "22:00", where: "tavern", doing: "一杯やる" }),
    at({ from: "23:00", where: "home", doing: "眠る" }),
  ],
  ヘレナ: [
    at({ from: "09:30", where: "work", doing: "道具屋の昼番" }),
    at({ from: "16:00", where: "home", doing: "繕い物" }),
    at({ from: "17:00", where: P("phanthiet", "s2b"), doing: "夜市で買い物" }),
    at({ from: "18:30", where: "home", doing: "眠る" }),
  ],
  // ---------------------------------------------------------------- the shopping street
  フランツ: [
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "15:00", where: "work", doing: "酒場を開ける" }),
    at({ from: "03:00", where: { map: "phanthiet-market", tile: [6.2, 16.6] }, doing: "酒場の裏で樽を入れ替える" }),
    at({ from: "04:00", where: "work", doing: "酒場を開ける" }),
  ],
  // herbs picked on the meadow while it is light; before opening, a cup at the inn with Gerda, who learnt her potions from her
  イルムガルト: [
    at({ from: "07:00", where: "home", doing: "眠る" }),
    at({ from: "13:30", where: { map: "south-meadow", cell: [32, 66] }, doing: "薬草を摘む" }),
    at({ from: "15:00", where: "inn", doing: "宿で一服" }),
    at({ from: "16:00", where: "work", doing: "薬を売る" }),
  ],
  // the two shifts overlap for half an hour, to hand over the till and the book
  ブルーノ: [
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "15:30", where: "work", doing: "道具屋の夜番" }),
    at({ from: "01:00", where: { map: "phanthiet-market", tile: [17.2, 23.4] }, doing: "店の前の灰を掃く" }),
    at({ from: "01:30", where: "work", doing: "道具屋の夜番" }),
  ],
  // a bunch of Sophie's flowers on the way back from supper; a last cup with Beatrix before bed
  マグダレーナ: [
    at({ from: "05:30", where: "tavern", doing: "ベアトリクスと一杯" }),
    at({ from: "07:30", where: "home", doing: "眠る" }),
    at({ from: "15:30", where: "work", doing: "仕立てて売る" }),
    at({ from: "19:30", where: P("phanthiet-market", "marketWell"), doing: "ゾフィーの花を買いに出る" }),
    at({ from: "20:00", where: "work", doing: "仕立てて売る" }),
  ],
  コンスタンティン: [
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "17:00", where: P("phanthiet-market", "h-m2"), doing: "通りの様子を見て歩く" }),
    at({ from: "18:00", where: "work", doing: "結晶を売る" }),
    at({ from: "03:00", where: P("phanthiet-market", "h-m2"), doing: "夜更けの通りを見て歩く" }),
    at({ from: "04:00", where: "work", doing: "結晶を売る" }),
  ],
  ラインホルト: [
    at({ from: "00:30", where: "tavern", doing: "ルドルフと一杯" }),
    at({ from: "01:30", where: "work", doing: "素材を買い取る" }),
    at({ from: "05:00", where: { map: "phanthiet-market", tile: [33.4, 25.6] }, doing: "夜明け前の荷車を待つ" }),
    at({ from: "06:00", where: "work", doing: "素材を買い取る" }),
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "16:30", where: "work", doing: "素材を買い取る" }),
  ],
  // ---------------------------------------------------------------- the craftsmen's lane
  ベアトリクス: [
    at({ from: "07:30", where: "home", doing: "眠る" }),
    at({ from: "16:00", where: "work", doing: "防具を直して売る" }),
    at({ from: "22:00", where: { map: "phanthiet-craft", cell: [33, 52] }, doing: "共同の炉で鉄を打つ" }),
    at({ from: "00:00", where: "work", doing: "防具を直して売る" }),
    at({ from: "05:30", where: "tavern", doing: "一杯やる" }),
  ],
  ゴットフリート: [
    at({ from: "07:30", where: "home", doing: "眠る" }),
    at({ from: "16:00", where: "work", doing: "木を削って売る" }),
    at({ from: "23:00", where: P("phanthiet-craft", "h-c3"), doing: "空き家の戸を直してやる" }),
    at({ from: "00:00", where: "work", doing: "木を削って売る" }),
  ],
  ルドルフ: [
    at({ from: "00:30", where: "tavern", doing: "ラインホルトと一杯" }),
    at({ from: "01:30", where: "work", doing: "革を売る" }),
    at({ from: "07:30", where: "home", doing: "眠る" }),
    at({ from: "15:30", where: "work", doing: "革を売る" }),
  ],
  // ---------------------------------------------------------------- the south gate
  // at dusk he walks up to the square to hand the town over to the night watch
  オイゲン: [
    at({ from: "08:00", where: "work", doing: "昼番で門に立つ" }),
    at({ from: "16:30", where: { map: "phanthiet", tile: [28.25, 22.75] }, doing: "夜番に引き継ぐ" }),
    at({ from: "17:00", where: "home", doing: "眠る" }),
  ],
  テオ: [
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "15:30", where: "work", doing: "道を教える" }),
    at({ from: "03:00", where: P("phanthiet-gate", "gateWell"), doing: "井戸端で夜明かしの話" }),
    at({ from: "04:00", where: "work", doing: "道を教える" }),
  ],
  // she comes out to the gate's well before opening; Teo is already at his post
  ヒルデ: [
    at({ from: "07:00", where: "home", doing: "眠る" }),
    at({ from: "15:30", where: P("phanthiet-gate", "gateWell"), doing: "井戸端でテオと話す" }),
    at({ from: "16:00", where: "work", doing: "荷を預かる" }),
    at({ from: "23:00", where: { map: "phanthiet-gate", tile: [30.5, 25.5] }, doing: "倉庫の前の灰を掃く" }),
    at({ from: "23:30", where: "work", doing: "荷を預かる" }),
  ],
  // ---------------------------------------------------------------- the households that grew, and the ones that moved in
  // the baker's girl carries the bread basket for her brother, plays under the night market's lights, and sees her mother's first firing
  ローザ: [
    at({ from: "03:30", where: "home", doing: "眠る" }),
    at({ from: "16:30", where: "home", doing: "起きて兄の支度を手伝う" }),
    at({ from: "17:00", where: "work", doing: "店先でパンの籠を持つ" }),
    at({ from: "19:30", where: { map: "phanthiet", cell: [38, 46] }, doing: "夜市の灯りの下で遊ぶ" }),
    at({ from: "21:00", where: "work", doing: "店先でパンの籠を持つ" }),
    at({ from: "02:30", where: { map: "phanthiet", cell: [23, 46] }, doing: "母の窯の火を見に行く" }),
  ],
  ニーナ: [at({ from: "08:30", where: "home", doing: "眠る" }), at({ from: "16:00", where: "work", doing: "給仕をする" })],
  ゼップ: [at({ from: "07:00", where: "home", doing: "眠る" }), at({ from: "14:00", where: "work", doing: "煮込みの仕込みをする" })],
  フェルディナント: [
    at({ from: "09:00", where: "home", doing: "眠る" }),
    at({ from: "17:00", where: "inn", doing: "宿の暖炉で地図を描く" }),
    at({ from: "19:00", where: "work", doing: "通りを写し描く" }),
    at({ from: "23:00", where: { map: "phanthiet-gate", tile: [26, 31] }, doing: "門の通りを測って歩く" }),
    at({ from: "01:00", where: { map: "phanthiet", tile: [30.5, 25.5] }, doing: "広場を写し描く" }),
    at({ from: "03:30", where: "work", doing: "通りを写し描く" }),
  ],
  // the farm keeps day hours; the grandmother spins at the door and helps her daughter at the stall
  ゲルトルート: [
    at({ from: "07:00", where: "home", doing: "起きて火を熾す" }),
    at({ from: "09:00", where: "work", doing: "戸口で糸を紡ぐ" }),
    at({ from: "15:00", where: "home", doing: "家のこと" }),
    at({ from: "16:00", where: { map: "phanthiet-market", tile: [21, 28.6] }, doing: "娘の焼き芋を手伝う" }),
    at({ from: "19:00", where: "home", doing: "眠る" }),
  ],
  ヴァルター: [
    at({ from: "06:00", where: "home", doing: "朝の支度" }),
    at({ from: "07:00", where: "work", doing: "畑を耕す" }),
    at({ from: "15:30", where: { map: "phanthiet", tile: [38.4, 29.9] }, doing: "豚の世話" }),
    at({ from: "17:00", where: "tavern", doing: "一杯やる" }),
    at({ from: "18:30", where: "home", doing: "眠る" }),
  ],
  クレメンス: [at({ from: "08:00", where: "home", doing: "眠る" }), at({ from: "15:00", where: "home", doing: "粥の支度" }), at({ from: "16:30", where: "work", doing: "灯明を守る" })],
  // the fisher's boy goes down to the beach with his father before dawn, and spends the evening in the square
  パウル: [
    at({ from: "03:30", where: { map: "net-sheds", tile: [20, 15] }, doing: "父と網を揚げる" }),
    at({ from: "08:30", where: "work", doing: "魚を運ぶ" }),
    at({ from: "13:00", where: "home", doing: "眠る" }),
    at({ from: "20:30", where: "home", doing: "起きて夕餉" }),
    at({ from: "21:30", where: { map: "phanthiet", cell: [40, 47] }, doing: "広場で仲間と過ごす" }),
    at({ from: "02:30", where: "home", doing: "支度をする" }),
  ],
  レナ: [
    at({ from: "12:00", where: "home", doing: "起きて母の手伝い" }),
    at({ from: "12:30", where: "work", doing: "洗濯場のそばで貝殻を並べる" }),
    at({ from: "17:00", where: { map: "phanthiet", cell: [39, 44] }, doing: "夜市の灯りの下で遊ぶ" }),
    at({ from: "20:30", where: "home", doing: "家に帰る" }),
    at({ from: "21:30", where: "home", doing: "眠る" }),
  ],
  ヨナス: [
    at({ from: "13:30", where: "home", doing: "起きて家の手伝い" }),
    at({ from: "14:30", where: { map: "phanthiet", tile: [28, 31.4] }, doing: "母の洗濯場で遊ぶ" }),
    at({ from: "17:00", where: "work", doing: "父の果物を数えて並べる" }),
    at({ from: "20:30", where: "home", doing: "眠る" }),
  ],
  エミール: [
    at({ from: "16:00", where: "home", doing: "起きて母にくっつく" }),
    at({ from: "17:30", where: { map: "phanthiet-market", tile: [16, 26.4] }, doing: "母について夜市を歩く" }),
    at({ from: "19:30", where: "home", doing: "夕餉" }),
    at({ from: "20:00", where: { map: "phanthiet-market", tile: [14.6, 27.4] }, doing: "古着の山で遊ぶ" }),
    at({ from: "22:30", where: "home", doing: "眠る" }),
  ],
  アウグスト: [
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "16:00", where: "work", doing: "灯りを直す" }),
    at({ from: "22:00", where: "inn", doing: "宿で一服" }),
    at({ from: "23:00", where: "work", doing: "灯りを直す" }),
  ],
  ヘートヴィヒ: [
    at({ from: "07:00", where: "home", doing: "眠る" }),
    at({ from: "15:30", where: "work", doing: "戸口で首巻きを編む" }),
    at({ from: "22:00", where: "inn", doing: "宿で一服" }),
    at({ from: "23:30", where: "work", doing: "戸口で首巻きを編む" }),
  ],
  ティム: [
    at({ from: "01:00", where: "home", doing: "眠る" }),
    at({ from: "15:30", where: "home", doing: "起きて火屋を磨く" }),
    at({ from: "16:30", where: "work", doing: "祖父の横で火屋を磨く" }),
    at({ from: "17:00", where: { map: "phanthiet", cell: [37, 47] }, doing: "夜市の灯りの下で遊ぶ" }),
    at({ from: "21:30", where: "work", doing: "祖母の毛糸を巻く" }),
  ],
  // ---------------------------------------------------------------- the shopping street
  リリー: [at({ from: "07:30", where: "home", doing: "眠る" }), at({ from: "16:00", where: "work", doing: "給仕をする" })],
  マックス: [
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "15:30", where: "work", doing: "樽を仕込む" }),
    at({ from: "01:00", where: "tavern", doing: "一杯やる" }),
    at({ from: "02:00", where: "work", doing: "樽を仕込む" }),
    at({ from: "03:00", where: { map: "phanthiet-market", tile: [7.2, 16.6] }, doing: "酒場の裏で樽を運ぶ" }),
    at({ from: "04:00", where: "work", doing: "樽を仕込む" }),
  ],
  エーファ: [
    at({ from: "06:30", where: "home", doing: "眠る" }),
    at({ from: "13:30", where: { map: "south-meadow", cell: [34, 67] }, doing: "師匠と薬草を摘む" }),
    at({ from: "15:00", where: "home", doing: "薬草を干す" }),
    at({ from: "16:00", where: "work", doing: "薬を売る" }),
  ],
  ロッテ: [at({ from: "07:30", where: "home", doing: "眠る" }), at({ from: "15:30", where: "work", doing: "縫い物をする" })],
  カスパー: [
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "16:00", where: "work", doing: "荷を運び込む" }),
    at({ from: "00:30", where: "tavern", doing: "祖父と一杯" }),
    at({ from: "01:30", where: "work", doing: "荷を運び込む" }),
  ],
  エーリヒ: [
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "16:00", where: "work", doing: "手紙を代わりに書く" }),
    at({ from: "20:00", where: { map: "phanthiet-in-h-m5", cell: [52, 47] }, doing: "寄り合いの記録をつける", activity: { kind: "records" } }),
    at({ from: "23:00", where: { map: "phanthiet", tile: [11.4, 8.6] }, doing: "礼拝堂の記録を写す" }),
    at({ from: "00:00", where: "work", doing: "手紙を代わりに書く" }),
  ],
  マリー: [at({ from: "08:30", where: "home", doing: "眠る" }), at({ from: "16:30", where: "work", doing: "戸口で薬草茶を売る" })],
  // the children go to the letters class in the hall in the evening (the teacher, Christian)
  ハンナ: [
    at({ from: "23:00", where: "home", doing: "眠る" }),
    at({ from: "15:30", where: "home", doing: "起きて母の手伝い" }),
    at({ from: "16:30", where: "work", doing: "父の横で字を習う" }),
    at({ from: "21:00", where: { map: "phanthiet-in-h-m5", cell: [42, 45] }, doing: "寄り合い所で字を習う", activity: { kind: "lesson", role: "student" } }),
  ],
  アガーテ: [at({ from: "08:00", where: "home", doing: "眠る" }), at({ from: "16:00", where: "work", doing: "ろうそくを売る" })],
  ジーモン: [
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "16:00", where: "work", doing: "灯り油を量り売りする" }),
    at({ from: "22:00", where: { map: "phanthiet", tile: [31, 26.5] }, doing: "広場で油を売り歩く" }),
    at({ from: "01:00", where: { map: "phanthiet-craft", tile: [21, 21.8] }, doing: "職人通りで油を売り歩く" }),
    at({ from: "03:00", where: "work", doing: "灯り油を量り売りする" }),
  ],
  フェリックス: [
    at({ from: "01:30", where: "home", doing: "眠る" }),
    at({ from: "15:30", where: "home", doing: "起きて芯を切る" }),
    at({ from: "16:30", where: "work", doing: "ろうそくの芯を切る" }),
    at({ from: "21:00", where: { map: "phanthiet-in-h-m5", cell: [44, 45] }, doing: "寄り合い所で字を習う", activity: { kind: "lesson", role: "student" } }),
    at({ from: "23:00", where: "work", doing: "ろうそくの芯を切る" }),
  ],
  // ---------------------------------------------------------------- the craftsmen's lane
  ルイーゼ: [
    at({ from: "07:30", where: "home", doing: "眠る" }),
    at({ from: "16:00", where: "work", doing: "防具を磨く" }),
    at({ from: "22:00", where: { map: "phanthiet-craft", cell: [35, 52] }, doing: "共同の炉で師匠の鎚を受ける" }),
    at({ from: "00:00", where: "work", doing: "防具を磨く" }),
  ],
  アントン: [at({ from: "07:30", where: "home", doing: "眠る" }), at({ from: "15:30", where: "work", doing: "樽を組む" })],
  ハインリヒ: [at({ from: "08:00", where: "home", doing: "眠る" }), at({ from: "16:00", where: "work", doing: "器を焼く" })],
  テレーゼ: [at({ from: "08:30", where: "home", doing: "眠る" }), at({ from: "16:30", where: "work", doing: "器に絵をつける" })],
  アデーレ: [
    at({ from: "09:00", where: "home", doing: "眠る" }),
    at({ from: "16:30", where: "work", doing: "窯の番" }),
    at({ from: "17:30", where: { map: "phanthiet-market", tile: [26.6, 26.8] }, doing: "夜市で器を売る" }),
    at({ from: "23:00", where: "work", doing: "窯の番" }),
  ],
  エマ: [at({ from: "08:00", where: "home", doing: "眠る" }), at({ from: "16:00", where: "work", doing: "籠を編む" })],
  ニクラス: [
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "16:00", where: "work", doing: "木を運ぶ" }),
    at({ from: "23:00", where: { map: "phanthiet-craft", cell: [64, 48] }, doing: "母に夜食を届ける" }),
    at({ from: "23:30", where: "work", doing: "木を運ぶ" }),
  ],
  フリーダ: [
    at({ from: "01:00", where: "home", doing: "眠る" }),
    at({ from: "15:30", where: "home", doing: "起きて柳を選る" }),
    at({ from: "16:30", where: "work", doing: "母の籠の柳を選る" }),
    at({ from: "21:00", where: { map: "phanthiet-in-h-m5", cell: [46, 45] }, doing: "寄り合い所で字を習う", activity: { kind: "lesson", role: "student" } }),
    at({ from: "23:00", where: "work", doing: "母の籠の柳を選る" }),
  ],
  ローゼマリー: [
    at({ from: "23:00", where: "home", doing: "眠る" }),
    at({ from: "16:30", where: "home", doing: "起きて茶を淹れる" }),
    at({ from: "17:00", where: "work", doing: "戸口で柳を水に浸す" }),
  ],
  マルクス: [
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "16:00", where: "work", doing: "石を割る" }),
    at({ from: "21:00", where: { map: "phanthiet", tile: [21.5, 26.2] }, doing: "広場の石畳を直す" }),
    at({ from: "00:00", where: "work", doing: "石を割る" }),
  ],
  カタリーナ: [at({ from: "08:30", where: "home", doing: "眠る" }), at({ from: "16:30", where: "work", doing: "灰をふるって灰汁を作る" })],
  ダニエル: [at({ from: "01:00", where: "home", doing: "眠る" }), at({ from: "15:30", where: "home", doing: "起きて水を汲む" }), at({ from: "16:30", where: "work", doing: "父の石を運ぶ" })],
  イダ: [
    at({ from: "23:00", where: "home", doing: "眠る" }),
    at({ from: "15:30", where: "home", doing: "起きて母の手伝い" }),
    at({ from: "16:30", where: "work", doing: "石を並べて遊ぶ" }),
    at({ from: "21:00", where: { map: "phanthiet-in-h-m5", cell: [48, 45] }, doing: "寄り合い所で字を習う", activity: { kind: "lesson", role: "student" } }),
  ],
  // the sweep and his boy go round the town's chimneys: the square, then the shopping street, then home
  ベルンハルト: [
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "16:00", where: { map: "phanthiet", tile: [27, 22.6] }, doing: "屋根の灰を下ろす" }),
    at({ from: "20:00", where: { map: "phanthiet-market", tile: [20, 22.6] }, doing: "煙突を掃く" }),
    at({ from: "00:00", where: "work", doing: "道具の手入れ" }),
    at({ from: "03:00", where: { map: "phanthiet-gate", tile: [26.4, 14] }, doing: "門の詰所の煙突を掃く" }),
    at({ from: "05:00", where: "work", doing: "道具の手入れ" }),
  ],
  モニカ: [at({ from: "08:30", where: "home", doing: "眠る" }), at({ from: "16:30", where: "work", doing: "灰を袋に詰めて売る" })],
  トビアス: [
    at({ from: "02:00", where: "home", doing: "眠る" }),
    at({ from: "15:30", where: "home", doing: "起きて腹ごしらえ" }),
    at({ from: "16:00", where: { map: "phanthiet", tile: [27.8, 23.4] }, doing: "親方と屋根に上がる" }),
    at({ from: "20:00", where: { map: "phanthiet-market", tile: [21, 23] }, doing: "細い煙突に潜る" }),
    at({ from: "00:00", where: "work", doing: "ぶらしの煤を落とす" }),
  ],
  // ---------------------------------------------------------------- the south gate
  シュテファン: [
    at({ from: "07:30", where: { map: "phanthiet", tile: [29.5, 22.6] }, doing: "夜明けに広場の夜番と落ち合う" }),
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "16:00", where: "work", doing: "夜番で門に立つ" }),
  ],
  ヴェロニカ: [
    at({ from: "07:00", where: "home", doing: "起きて支度" }),
    at({ from: "07:30", where: { map: "phanthiet", tile: [28.6, 23.6] }, doing: "広場で夜番から引き継ぐ" }),
    at({ from: "08:00", where: "work", doing: "昼番で通りを見回る" }),
    at({ from: "16:30", where: "home", doing: "夕餉" }),
    at({ from: "17:30", where: "home", doing: "眠る" }),
  ],
  ゲオルク: [at({ from: "07:00", where: "home", doing: "眠る" }), at({ from: "15:00", where: "work", doing: "荷を担いで運び込む" })],
  クルト: [
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "16:00", where: "work", doing: "鍋の穴をふさぐ" }),
    at({ from: "23:00", where: { map: "phanthiet", tile: [33, 27] }, doing: "広場で鍋を直す" }),
    at({ from: "03:00", where: "work", doing: "鍋の穴をふさぐ" }),
  ],
  ザビーネ: [at({ from: "08:30", where: "home", doing: "眠る" }), at({ from: "16:30", where: "work", doing: "刃物を研ぐ" })],
  ヨハン: [
    at({ from: "23:00", where: "home", doing: "眠る" }),
    at({ from: "15:30", where: "home", doing: "起きて手伝い" }),
    at({ from: "16:30", where: "work", doing: "鋳掛けの火を吹く" }),
    at({ from: "21:00", where: { map: "phanthiet-in-h-m5", cell: [50, 45] }, doing: "寄り合い所で字を習う", activity: { kind: "lesson", role: "student" } }),
  ],
  リナ: [
    at({ from: "23:00", where: "home", doing: "眠る" }),
    at({ from: "15:30", where: "home", doing: "起きて手伝い" }),
    at({ from: "16:30", where: "work", doing: "母の砥石に水をかける" }),
    at({ from: "21:00", where: { map: "phanthiet-in-h-m5", cell: [52, 45] }, doing: "寄り合い所で字を習う", activity: { kind: "lesson", role: "student" } }),
  ],
  // the hunters keep the forest's hours: out at the traps before dawn, the skins in the afternoon
  ファルク: [
    at({ from: "03:30", where: { map: "forest-edge", tile: [14, 20] }, doing: "罠を見て回る" }),
    at({ from: "09:30", where: "work", doing: "獲物の皮を剥ぐ" }),
    at({ from: "13:00", where: "home", doing: "眠る" }),
    at({ from: "20:30", where: { map: "phanthiet-craft", tile: [24.4, 22.4] }, doing: "ルドルフに皮を届ける" }),
    at({ from: "21:30", where: "work", doing: "矢を削る" }),
  ],
  ブリギッテ: [at({ from: "09:00", where: "home", doing: "眠る" }), at({ from: "17:00", where: "work", doing: "肉を燻す" })],
  ロルフ: [
    at({ from: "03:30", where: { map: "forest-edge", tile: [15, 21] }, doing: "父と罠を見て回る" }),
    at({ from: "09:30", where: "work", doing: "皮を張る" }),
    at({ from: "13:00", where: "home", doing: "眠る" }),
    at({ from: "20:30", where: "work", doing: "弓の弦を張り替える" }),
  ],
  クリスティアン: [
    at({ from: "08:00", where: "home", doing: "眠る" }),
    at({ from: "16:00", where: "work", doing: "教える支度をする" }),
    at({ from: "20:30", where: { map: "phanthiet-in-h-m5", cell: [44, 43] }, doing: "寄り合い所で子どもに字を教える", activity: { kind: "lesson", role: "teacher" } }),
    at({ from: "23:30", where: "work", doing: "書き物をする" }),
  ],
  ドロテア: [at({ from: "08:00", where: "home", doing: "眠る" }), at({ from: "15:00", where: "inn", doing: "宿でイルムガルトと一服" }), at({ from: "16:00", where: "work", doing: "薬湯を煎じる" })],
  ラウラ: [
    at({ from: "23:00", where: "home", doing: "眠る" }),
    at({ from: "15:30", where: "home", doing: "起きて本を読む" }),
    at({ from: "16:30", where: "work", doing: "弟の面倒を見る" }),
    at({ from: "21:00", where: { map: "phanthiet-in-h-m5", cell: [42, 47] }, doing: "寄り合い所で字を習う", activity: { kind: "lesson", role: "student" } }),
  ],
  ベンヤミン: [
    at({ from: "23:00", where: "home", doing: "眠る" }),
    at({ from: "15:30", where: "home", doing: "起きて木の馬で遊ぶ" }),
    at({ from: "16:30", where: "work", doing: "木の馬で遊ぶ" }),
    at({ from: "21:00", where: { map: "phanthiet-in-h-m5", cell: [44, 47] }, doing: "寄り合い所で字を習う", activity: { kind: "lesson", role: "student" } }),
  ],
  エドガー: [
    at({ from: "02:00", where: "home", doing: "眠る" }),
    at({ from: "16:00", where: "work", doing: "門の通りを眺める" }),
    at({ from: "22:00", where: P("phanthiet-gate", "gateWell"), doing: "井戸端で昔話" }),
    at({ from: "23:00", where: "work", doing: "門の通りを眺める" }),
  ],
  マルグリット: [
    at({ from: "02:00", where: "home", doing: "眠る" }),
    at({ from: "17:00", where: "work", doing: "戸口で編み物" }),
    at({ from: "22:00", where: "inn", doing: "宿でヘートヴィヒと編み物" }),
    at({ from: "23:30", where: "work", doing: "戸口で編み物" }),
  ],
}

/** Authored work and lesson places replace coordinates left over from an older layout. */
export const ROUTINES: Record<string, readonly Slot[]> = Object.fromEntries(
  Object.entries(baseRoutines).map((entry) => {
    const name = entry[0]
    const slots = entry[1]
    return [name, slots.map((slot) => withRoutineActivitySpot({ name, slot, rooms: INTERIORS }))]
  }),
)

export const schedules = new Map(
  Object.entries(ROUTINES).map((entry2) => {
    const name = entry2[0]
    const slots = entry2[1]
    return [name, new CyclicSchedule(slots)]
  }),
)

/** The people who drink at a place, in a fixed order, so each has their own seat. */
export const routinePatrons: Record<"tavern" | "inn", string[]> = {
  tavern: Object.entries(ROUTINES)
    .filter((entry3) => {
      const d = entry3[1]
      return d.some((s) => s.where === "tavern")
    })
    .map((entry4) => {
      const n = entry4[0]
      return n
    }),
  inn: Object.entries(ROUTINES)
    .filter((entry5) => {
      const d = entry5[1]
      return d.some((s) => s.where === "inn")
    })
    .map((entry6) => {
      const n = entry6[0]
      return n
    }),
}
