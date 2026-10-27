// Errands (economy.md §6): each day some residents ask a small favour that comes out of their work —
// bring the cook some fish, carry the farmer's eggs to the bakery. Which resident asks what is decided
// by the date, so everyone in town hears the same requests. Doing one pays a little, and the resident
// warms to you: friendship (0–100) changes what they say and takes up to 10% off their prices.
import { countItem, type Bag } from "./bag.ts"
import type { ItemId } from "./items.ts"
import { ITEMS } from "./items.ts"

export interface Errand {
  id: string
  /** who asks */
  from: string
  /** bring them things, or carry something of theirs to someone */
  kind: "bring" | "deliver"
  wants?: { item: ItemId; count: number }
  /** deliver: who it goes to, and what it is */
  to?: string
  parcel?: string
  /** what they say when they ask */
  ask: string
  /** what is said when it is done (by the one who receives it) */
  thanks: string
  gold: number
}

/**
 * A bring errand pays a little under the things' shop price: twice what a shop would pay you for them,
 * but buying them to hand over costs a few coins — it is done for the person, not for the money.
 */
const pay = (item: ItemId, count: number) => Math.floor(ITEMS[item].price * count * 0.9)

const bring = (id: string, from: string, item: ItemId, count: number, ask: string, thanks: string): Errand => ({
  id,
  from,
  kind: "bring",
  wants: { item, count },
  ask,
  thanks,
  gold: pay(item, count),
})
const deliver = (id: string, from: string, to: string, parcel: string, gold: number, ask: string, thanks: string): Errand => ({ id, from, kind: "deliver", to, parcel, ask, thanks, gold })

export const ERRANDS: readonly Errand[] = [
  bring("irmgard-herbs", "イルムガルト", "blue-herb", 2, "店の薬を煎じる分が足りないの。青い薬草を二つ、見つけたら持ってきなさい。", "よく見つけたわね。これで今夜の分は煎じられる。"),
  bring("irmgard-jelly", "イルムガルト", "jelly", 3, "回復薬を練るゼリーが切れそうなの。草原のスライムから三つ、取ってきなさい。", "ちゃんとぷるぷるしてるわね。助かったわ。"),
  bring("gerda-mushrooms", "ゲルダ", "mushroom", 4, "今夜はきのこの煮込みを多めに作りたいんだよ。森のきのこを四つ、頼めるかい？", "いい香りだねえ。温まっておいき。"),
  bring("franz-fish", "フランツ", "sea-fish", 4, "魚のスープの仕込みに、浜の小魚があと四尾ほしい。網小屋で釣ってきてくれるか。", "いい魚だ。今夜の一杯はうまくなる。"),
  bring("marta-firewood", "マルタ", "firewood", 5, "窯の薪が心もとないのよ。五束あると、明日の朝まで焼けるんだけど。", "これで朝の窯が焚けるわ。ありがとうね。"),
  bring("gunter-charcoal", "ギュンター", "charcoal", 3, "炭を三つ持ってきてくれ。ヨーゼフの窯のでいい。", "上等だ。これで今夜も鉄が打てるぜ。"),
  bring(
    "gunter-scrap",
    "ギュンター",
    "rusty-scrap",
    3,
    "鉄くずを三つ持ってきてくれ。砂丘の砂スライムが取り込んでるやつでもいい。溶かして鍬を直す。",
    "錆びてても中は使える。カールの鍬を直してやれるぜ。",
  ),
  bring(
    "beatrix-ingots",
    "ベアトリクス",
    "iron-ingot",
    2,
    "兜の縁を直す鉄が足りないんだ。延べ棒を二本、持ってきてくれるかい。薄くなったままじゃ危ないからね。",
    "これなら丈夫に直せるよ。助かった。防具は命を預かるものだからね。",
  ),
  bring("gottfried-logs", "ゴットフリート", "log", 3, "板にする原木が足りん。三本、森で伐ってきてくれ。", "まっすぐな木だ。いい板になる。"),
  bring("rudolf-fur", "ルドルフ", "soft-fur", 3, "やわらかい冬毛を三つ、持ってこい。野うさぎのでいい。靴の内張りにするんだぞ。", "毛並みがいい。ありがたい。"),
  bring("benedikt-herbs", "ベネディクト", "herb", 4, "寝込んでいる人に薬湯を出したいのです。薬草を四束、分けていただけませんか。", "女神さまの代わりに、お礼を言わせてください。"),
  bring("karl-firewood", "カール", "firewood", 4, "栗を焼く薪が足りなくてな。四束あれば、今夜はもつだろうな。", "これで焦がさずに焼けるな。"),
  bring(
    "wilhelm-flowers",
    "ヴィルヘルム",
    "meadow-flower",
    2,
    "若いの、草原の花を二本摘んできてくれんかのう。ゾフィーの花は売り物じゃから、わしが取るわけにはいかん。",
    "おお、いい色じゃ。部屋が明るうなった。",
  ),
  bring("mia-flower", "ミア", "meadow-flower", 1, "ねえねえ、草原の花、一本だけ取ってきて。母さんにあげるの。", "わあ、きれい！母さんには、わたしが摘んだってことにしてね。"),
  bring("peter-charcoal", "ペーター", "charcoal", 2, "炉の炭が切れそうなんです！ヨーゼフさんの炭を二つ、お願いできますか！", "助かりました！これで親方に叱られずにすみます！"),
  bring("fritz-jelly", "フリッツ", "jelly", 2, "スライムのゼリーってどんなだ？二つ取ってきてくれよ！ディーターさんに見せるんだ！", "ぷるぷるだ！すげえ！"),
  deliver("josef-charcoal", "ヨーゼフ", "ギュンター", "炭", 12, "この炭をギュンターの炉まで届けてくれ。広場の鍛冶屋だ。", "ヨーゼフの炭か。ちょうど切れるところだった。"),
  deliver("jakob-fish", "ヤコブ", "フランツ", "干し魚", 10, "干し魚を酒場のフランツさんに。頼めるか。", "ヤコブの干し魚か。いい肴になる。"),
  deliver("hans-bread", "ハンス", "ディーター", "夜食のパン", 8, "夜番のディーターさんに、夜食のパンを届けてくれない？", "ハンスのパンか。夜が少し短くなる。"),
  deliver("anna-linen", "アンナ", "ゲルダ", "宿のシーツ", 10, "洗い上がった宿のシーツ、ゲルダさんのところへ持ってってくれる？重いのよ、これ。", "ぱりっと乾いてるね。アンナにもよろしく。"),
  deliver("ulrike-eggs", "ウルリケ", "マルタ", "卵の籠", 10, "パン屋のマルタさんに、卵を一籠届けてほしいの。割らないでね。", "ウルリケの卵ね。二度目の窯のパイに使うわ。"),
  deliver("grete-pickles", "グレーテ", "フランツ", "酢漬けの瓶", 10, "酒場のフランツさんに酢漬けの瓶を。お代はもらってあるから。", "グレーテの酢漬けか。酒が進む。"),
  deliver("eugen-oil", "オイゲン", "ブルーノ", "灯り油の注文", 8, "道具屋のブルーノに、この書き付けを渡してくれ。街灯の油の注文だ。", "油の注文ですね。毎度どうも。明日の夕方までに揃えておきますよ。"),
  deliver(
    "matthias-wool",
    "マティアス",
    "マグダレーナ",
    "羊の毛の袋",
    10,
    "仕立て屋さんに、この毛を届けてもらえませんか。……ぼくが行くと、うまく話せなくて。",
    "マティアスさんの毛ですね。手触りでわかります。",
  ),
  deliver("theo-parcel", "テオ", "ヒルデ", "取り次ぎの荷", 8, "この荷、ヒルデの倉庫まで頼めるかな。道を聞かれっぱなしでさ。", "テオの取り次ぎだね。数は……うん、合ってる。"),
  deliver("klara-lunch", "クララ", "オットー", "弁当", 8, "うちの人に弁当、届けてくれる？寝顔しか見ないのよ、あはは。", "クララの弁当か！夜市の前に食っとくよ！"),
  deliver(
    "magdalena-muffler",
    "マグダレーナ",
    "ヴィルヘルム",
    "直した首巻き",
    12,
    "ゾフィーさんに渡しそびれてしまいました。直した首巻きを、ヴィルヘルムさんに届けていただけますか。",
    "おお、ほつれが消えておる。ありがたいのう。",
  ),
]

export const errandOf = (id: string) => ERRANDS.find((e) => e.id === id)

/**
 * The errand day, as "2026-10-21": it turns over at six in the morning in Japan, when the town has
 * gone to bed, so a favour asked in the night can still be done before the sun is up.
 */
export const DAY_TURNS = 6 * 60
export const dayOf = (now: number) => new Date(now + (9 * 60 - DAY_TURNS) * 60_000).toISOString().slice(0, 10)

function hash(a: string): number {
  let h = 2166136261
  for (const c of a) {
    h ^= c.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  h ^= h >>> 13
  h = Math.imul(h, 0x5bd1e995)
  h ^= h >>> 15
  return (h >>> 0) / 4294967296
}

/** A little over half of those with something to ask ask it on a given day. */
const ASKS = 0.6

/** Bound the town's daily requests as more residents gain errands. */
export const DAILY_ERRAND_LIMIT = 18
const byResident = new Map<string, Errand[]>()
for (const errand of ERRANDS) {
  const list = byResident.get(errand.from) ?? []
  list.push(errand)
  byResident.set(errand.from, list)
}
let cachedDay: string | undefined
let daily = new Map<string, Errand>()

function requestsOn(day: string): ReadonlyMap<string, Errand> {
  if (cachedDay === day) return daily
  const candidates = [...byResident].map(([from, errands]) => ({ from, errands, rank: hash(`${day}:${from}`) }))
  const selected = candidates
    .filter((candidate) => candidate.rank < ASKS)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, DAILY_ERRAND_LIMIT)
  daily = new Map(selected.map(({ from, errands }) => [from, errands[Math.floor(hash(`${from}:${day}`) * errands.length)]]))
  cachedDay = day
  return daily
}

/** Today's errand from a resident, if they have one. */
export const errandToday = (from: string, day: string): Errand | undefined => requestsOn(day).get(from)

/** Every errand asked on a day, in resident definition order. */
export const errandsOn = (day: string) =>
  [...byResident.keys()].flatMap((from) => {
    const errand = errandToday(from, day)
    return errand ? [errand] : []
  })

/** An errand a player has taken: for today only. */
export interface Taken {
  id: string
  day: string
  done: boolean
}
/** errands open at once */
export const MAX_ERRANDS = 3

/** Friendship each thing earns. */
export const FRIEND = { bring: 6, deliver: 5, received: 2, bought: 1, commission: 3 } as const
export const FRIEND_MAX = 100

/** The price off for a friend: 1% for every 10 of friendship, at most 10%. */
export const friendDiscount = (friend: number) => Math.min(10, Math.floor(friend / 10)) / 100
/** A price after a friend's discount. */
export const friendPrice = (price: number, friend: number) => Math.max(1, Math.round(price * (1 - friendDiscount(friend))))

/** Raise friendship with someone, up to the cap. */
export function befriend(friends: Readonly<Record<string, number>>, name: string, by: number): Record<string, number> {
  return { ...friends, [name]: Math.min(FRIEND_MAX, (friends[name] ?? 0) + by) }
}

/** Today's errands only (yesterday's lapse). */
export const todays = (taken: readonly Taken[], now: number) => taken.filter((t) => t.day === dayOf(now))

/** A short line for the list: what to do, and for whom. */
export function errandLabel(e: Errand): string {
  return e.kind === "bring" ? `${e.from}に${ITEMS[e.wants!.item].name}×${e.wants!.count}` : `${e.from}の${e.parcel}を${e.to}へ`
}

export type ErrandProgress = "taken" | "ready" | "done"

/** Conversation context, restricted to today and the people involved; never completes an errand. */
export function errandProgress(player: { errands: readonly Taken[]; bag: Bag }, name: string, now: number): Record<string, ErrandProgress> {
  const progress: Record<string, ErrandProgress> = {}
  for (const taken of todays(player.errands, now)) {
    const errand = errandOf(taken.id)
    if (!errand || (errand.from !== name && errand.to !== name)) continue
    progress[taken.id] = taken.done ? "done" : (errand.kind === "deliver" ? errand.to === name : countItem(player.bag, errand.wants!.item) >= errand.wants!.count) ? "ready" : "taken"
  }
  return progress
}
