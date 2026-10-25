// A day in the life, worked out from the game's own tables (economy.md §7): does choosing a trade
// and buying the rest leave you better off than doing everything yourself? And with how high a
// ceiling on the life skills' levels together does that still hold (game-system.md §9.1)?
// Run: bun scripts/economy-sim.ts (prints the tables summed up in economy.md §7).
import { RECIPES, STAMINA_PER_CRAFT, craftedQuality, failChance } from "../world/core/crafting.ts"
import { STATIONS } from "../world/town/stations.ts"
import { GATHER_STAMINA, NODES, yieldOf, type NodeDef } from "../world/core/gather.ts"
import { ITEMS, QUALITY_PRICE, sellPrice, type ItemId, type Skill } from "../world/core/items.ts"
import { LIFE_CAP, LIFE_FINAL, LIFE_TOTAL_CAP, MILESTONES } from "../world/core/life.ts"
import { effectOf, priceOf } from "../world/core/makers.ts"
import { LISTING_FEE, TRADE_FEE } from "../world/core/exchange.ts"
import { OPEN_FIELDS } from "../world/maps/index.ts"
import { SHOPS } from "../world/core/shops.ts"

// ---------------------------------------------------------------- assumptions (one evening of play)
const MINUTES = 120
/** seconds a go takes, walking up to the spot included */
const GO_SECONDS = 12
/** minutes lost walking between places, per kind of place visited */
const TRAVEL_PER_PLACE = 6
/** stamina a day of life needs on top of work: the road out and back, the cold */
const DAILY_STAMINA = 24
/** the exchange sells at about this share of the shop price (players undercut the NPC) */
const EXCHANGE_SHARE = 0.85
/** How much you can eat in an evening: an empty stomach plus what digests meanwhile. */
const FULLNESS = 100 + MINUTES / 3

const fee = (station: string) => STATIONS.find((s) => s.kind === station)?.fee ?? 0
const cold = Math.ceil(GATHER_STAMINA * 1.5)
const recipe = (id: string) => RECIPES.find((r) => r.id === id)!

/**
 * Past level 8 the milestones are not written yet; the trial supposes each brings one more at a go
 * as 4 and 8 do (16, 32, 64), and lets quality and spoiling follow the level as they already do.
 */
const perGoAbove8 = (level: number) => MILESTONES.filter((m) => m > 8 && m <= level).length

/** What one go at a spot brings on average, item by item, at a level (alone at the spot). */
function goYield(kind: NodeDef["kind"], level: number): Partial<Record<ItemId, number>> {
  const node = NODES.find((n) => n.kind === kind && OPEN_FIELDS.concat(["phanthiet"]).includes(n.map))!
  const out: Partial<Record<ItemId, number>> = {}
  for (let i = 0; i < 200; i++) {
    const y = yieldOf(node, Math.min(level, LIFE_CAP), 1, (i + 0.5) / 200)
    out[y.item] = (out[y.item] ?? 0) + (y.count + perGoAbove8(level)) / 200
  }
  return out
}

/** How many goes the open spots of a kind allow in an evening, alone: what they hold and what comes back. */
function spotGoes(kind: NodeDef["kind"]): number {
  return NODES.filter((n) => n.kind === kind && (OPEN_FIELDS.includes(n.map) || n.map === "phanthiet")).reduce((a, n) => a + n.max + MINUTES / n.regen, 0)
}

/** The price multiplier quality brings to a made thing, on average, at a level. */
function qualityPrice(level: number): number {
  let sum = 0
  for (let i = 0; i < 400; i++) sum += QUALITY_PRICE[craftedQuality(level, 1, (i + 0.5) / 400)]
  return sum / 400
}

/** The best food to buy for work: the most stamina for how full it makes you, and its price per point. */
function bestFood(): { item: ItemId; perFull: number; perPoint: number } {
  let best = { item: "porridge" as ItemId, perFull: 0, perPoint: Infinity }
  for (const [id, it] of Object.entries(ITEMS) as [ItemId, (typeof ITEMS)[ItemId]][]) {
    const e = effectOf(id, 1)
    if (!it.use || e.stamina <= 0 || e.full <= 0) continue
    const perFull = e.stamina / e.full
    if (perFull > best.perFull) best = { item: id, perFull, perPoint: priceOf(id, 1) / e.stamina }
  }
  return best
}
const staminaBudget = (perFull: number) => 100 + FULLNESS * perFull

interface Day {
  name: string
  levels: string
  gold: number
  staminaUsed: number
  minutesWorked: number
  feesPaid: number
  note: string
}
type Levels = Partial<Record<Skill, number>>
const show = (l: Levels, names: Record<string, string>) =>
  Object.entries(l)
    .map(([s, n]) => `${names[s]} ${n}`)
    .join("・")
const NAMES: Record<string, string> = { woodcutting: "木こり", foraging: "採取", fishing: "釣り", cooking: "料理", carpentry: "木工" }

/**
 * A: does everything — herbs from the meadow, wood from the forest, trout from the river, their own
 * herb tea at the hearth (herbs and firewood), planks at the bench; eats the tea, sells the rest to the shops.
 */
function selfSufficient(l: Levels, capped: boolean): Day {
  const places = 5 // meadow, forest, river, workshop, shop
  const minutes = MINUTES - places * TRAVEL_PER_PLACE
  const tea = effectOf("herb-tea", 1)
  const perGo = (cold * 3 + STAMINA_PER_CRAFT * 2) / 5
  let goes = Math.min((minutes * 60) / GO_SECONDS, (staminaBudget(tea.stamina / tea.full) - DAILY_STAMINA) / perGo)
  // a fifth of the goes on each of: herbs, wood, fish, tea, planks — no more than the spots allow
  let share = goes / 5
  if (capped) share = Math.min(share, spotGoes("herbs"), spotGoes("tree"), spotGoes("fish"))
  goes = share * 5
  const herbY = goYield("herbs", l.foraging ?? 0),
    treeY = goYield("tree", l.woodcutting ?? 0),
    fishY = goYield("fish", l.fishing ?? 0)
  let herbs = (herbY.herb ?? 0) * share,
    firewood = (treeY.firewood ?? 0) * share,
    logs = (treeY.log ?? 0) * share
  const trout = (fishY.trout ?? 0) * share,
    scrap = (fishY["rusty-scrap"] ?? 0) * share,
    blue = (herbY["blue-herb"] ?? 0) * share
  const teaR = recipe("herb-tea"),
    plankR = recipe("plank")
  const teaGoes = Math.min(share, herbs / 2, firewood)
  const teas = teaGoes * teaR.output.count * (1 - failChance(l.cooking ?? 0, teaR.min))
  herbs -= teaGoes * 2
  firewood -= teaGoes
  const plankGoes = Math.min(share, logs)
  const planks = plankGoes * plankR.output.count * (1 - failChance(l.carpentry ?? 0, plankR.min))
  logs -= plankGoes
  const fees = teaGoes * fee("hearth") + plankGoes * fee("workbench")
  const stamina = share * 3 * cold + (teaGoes + plankGoes) * STAMINA_PER_CRAFT + DAILY_STAMINA
  // they drink their own tea for stamina, sell the rest at the shop's buying price
  const eaten = Math.min(teas, Math.max(0, stamina - 100) / tea.stamina)
  const sold =
    (teas - eaten) * sellPrice("herb-tea") * qualityPrice(l.cooking ?? 0) +
    planks * sellPrice("plank") +
    herbs * sellPrice("herb") +
    blue * sellPrice("blue-herb") +
    trout * sellPrice("trout") +
    scrap * sellPrice("rusty-scrap") +
    logs * sellPrice("log") +
    firewood * sellPrice("firewood")
  const shortfall = Math.max(0, stamina - 100 - eaten * tea.stamina) * bestFood().perPoint
  return {
    name: "A 何でも自分で",
    levels: show(l, NAMES),
    gold: Math.round(sold - fees - shortfall),
    staminaUsed: Math.round(stamina),
    minutesWorked: minutes,
    feesPaid: Math.round(fees),
    note: "採取・木こり・釣り・料理（薬草茶）・木工を少しずつ。自分の茶を飲み、残りを店に売る",
  }
}

/** B: a woodworker — chops and cuts planks all evening, sells them on the exchange, buys their food. */
function specialist(l: Levels, capped: boolean): Day {
  const places = 3 // forest, workshop, exchange
  const minutes = MINUTES - places * TRAVEL_PER_PLACE
  const food = bestFood()
  const treeY = goYield("tree", l.woodcutting ?? 0)
  // as much time chopping as it takes to keep the bench busy: logs per chop against one log a cut
  const perChop = treeY.log ?? 0,
    chopShare = 1 / (1 + perChop)
  const perGo = cold * chopShare + STAMINA_PER_CRAFT * (1 - chopShare)
  let goes = Math.min((minutes * 60) / GO_SECONDS, (staminaBudget(food.perFull) - DAILY_STAMINA) / perGo)
  if (capped) goes = Math.min(goes, spotGoes("tree") / chopShare)
  const chop = goes * chopShare,
    cut = goes * (1 - chopShare)
  const logs = perChop * chop,
    firewood = (treeY.firewood ?? 0) * chop
  const plankR = recipe("plank")
  const planks = Math.min(cut, logs) * plankR.output.count * (1 - failChance(l.carpentry ?? 0, plankR.min))
  const unit = ITEMS.plank.price * EXCHANGE_SHARE
  const income = planks * unit * (1 - TRADE_FEE - LISTING_FEE) + firewood * sellPrice("firewood")
  const fees = cut * fee("workbench") + planks * unit * (TRADE_FEE + LISTING_FEE)
  const stamina = chop * cold + cut * STAMINA_PER_CRAFT + DAILY_STAMINA
  const bought = Math.max(0, stamina - 100) * food.perPoint
  return {
    name: "B 木工を専門に",
    levels: show(l, NAMES),
    gold: Math.round(income - cut * fee("workbench") - bought),
    staminaUsed: Math.round(stamina),
    minutesWorked: minutes,
    feesPaid: Math.round(fees),
    note: "木を切って板にし、取引所で売る。食べ物は買う",
  }
}

/** Spread a total over the five things A does, as evenly as the cap allows. */
function spread(total: number, cap: number): Levels {
  const skills: Skill[] = ["foraging", "woodcutting", "fishing", "cooking", "carpentry"]
  const out: Levels = {}
  skills.forEach((s, i) => {
    out[s] = Math.min(cap, Math.floor(total / 5) + (i < total % 5 ? 1 : 0))
  })
  return out
}

const table = (rows: Day[]) => [
  "| 暮らし方 | 生活スキル | 働いた時間 | 使ったスタミナ | 払った手数料 | 手元に残ったお金 | 1 時間あたり | やったこと |",
  "|---|---|---|---|---|---|---|---|",
  ...rows.map((d) => `| ${d.name} | ${d.levels} | ${d.minutesWorked} 分 | ${d.staminaUsed} | ${d.feesPaid}G | ${d.gold}G | ${(d.gold / (MINUTES / 60)).toFixed(0)}G | ${d.note} |`),
]

// ---------------------------------------------------------------- v0.1: the ceiling of 24, levels to 8
const out: string[] = []
const food = bestFood()
out.push(
  `前提: 一晩 ${MINUTES} 分遊ぶ。一回 ${GO_SECONDS} 秒、場所を変えるたび ${TRAVEL_PER_PLACE} 分歩く。暮らしに要るスタミナ ${DAILY_STAMINA}。食べられるのは満腹 ${Math.round(FULLNESS)} ぶん。取引所は店の値段の ${EXCHANGE_SHARE * 100}% で売れる。行けるのは町・草原・森だけ（浜の魚はない）。働くための食べ物でいちばん効くのは ${ITEMS[food.item].name}（満腹 1 につきスタミナ ${food.perFull.toFixed(2)}、1 点 ${food.perPoint.toFixed(2)}G）。`,
  "",
)
for (const capped of [false, true]) {
  const a = selfSufficient(spread(LIFE_TOTAL_CAP, LIFE_CAP), capped),
    b = specialist({ woodcutting: LIFE_CAP, carpentry: LIFE_CAP }, capped)
  out.push(
    `**v0.1（合計 ${LIFE_TOTAL_CAP}、一つ ${LIFE_CAP} まで）${capped ? "、採集の場所の量で頭打ち（一人で使えるとして）" : "、採集の場所の量は数えない"}**`,
    "",
    ...table([a, b]),
    "",
    `B は A の ${(b.gold / Math.max(1, a.gold)).toFixed(1)} 倍（目安は 1.5 倍以上）。`,
    "",
  )
}
// what it would be without the ceiling: A raises all five to 8
{
  const a = selfSufficient(spread(5 * LIFE_CAP, LIFE_CAP), false),
    b = specialist({ woodcutting: LIFE_CAP, carpentry: LIFE_CAP }, false)
  out.push(`参考: 合計の上限がなく、A が五つとも ${LIFE_CAP} まで上げた場合、B は A の ${(b.gold / Math.max(1, a.gold)).toFixed(1)} 倍。`, "")
}

// ---------------------------------------------------------------- the final ceiling, levels to 64
// Past 8 the trades are chains: gather, make the best the level allows, sell on the exchange. Each
// milestone brings its own things (economy.md §2.1). A spreads the ceiling over three chains (six
// skills); B takes one chain to 64. Both sell on the exchange and buy what they do not gather.

interface Chain {
  name: string
  gather: Skill
  craft: Skill
  spots: NodeDef["kind"][]
  maps: string[]
  later?: ItemId
}
const CHAINS: Chain[] = [
  { name: "木", gather: "woodcutting", craft: "carpentry", spots: ["tree"], maps: ["deep-forest"], later: "world-branch" },
  { name: "草", gather: "foraging", craft: "alchemy", spots: ["mushrooms", "herbs"], maps: ["deep-forest", "south-meadow"], later: "root-dew" },
  { name: "魚", gather: "fishing", craft: "cooking", spots: ["fish"], maps: ["phanthiet"] },
]
/** The spot at the foot of the world tree (not built yet): supposed one, two goes held, one back every two hours. */
const LATER_SPOT = { max: 2, regen: 120 }
/** what can be bought for inputs: a shop's shelf, and yarn and iron from the exchange (the makers' own goods) */
const SOLD = new Set(
  Object.values(SHOPS)
    .flatMap((x) => x.stock as readonly ItemId[])
    .concat(["yarn" as ItemId, "iron-ingot" as ItemId]),
)
const sale = (id: ItemId) => ITEMS[id].price * EXCHANGE_SHARE * (1 - TRADE_FEE - LISTING_FEE)

/** One go at each of a chain's spots, averaged: what comes at a level. */
function chainYield(c: Chain, level: number): Partial<Record<ItemId, number>> {
  const out: Partial<Record<ItemId, number>> = {}
  const nodes = c.spots.map((k, i) => NODES.find((n) => n.kind === k && n.map === c.maps[i])!)
  for (const node of nodes)
    for (let i = 0; i < 200; i++) {
      const y = yieldOf(node, level, 1, (i + 0.5) / 200)
      out[y.item] = (out[y.item] ?? 0) + (y.count + perGoAbove8(level)) / 200 / nodes.length
    }
  return out
}
const chainCapacity = (c: Chain) => NODES.filter((n) => c.spots.includes(n.kind) && c.maps.includes(n.map)).reduce((a, n) => a + n.max + MINUTES / n.regen, 0)

/**
 * An evening's goes on a chain at levels (gather, craft): gather, then make the dearest things the
 * craft level allows from what was gathered (buying the rest of the inputs), sell all on the exchange.
 * `capped`: the spots hold only so much (alone at them).
 */
function runChain(c: Chain, g: number, k: number, goes: number, capped: boolean): number {
  const recipes = RECIPES.filter((r) => r.skill === c.craft && r.min <= k).sort((a, b) => sale(b.output.item) * b.output.count - sale(a.output.item) * a.output.count)
  const per = chainYield(c, g)
  // try every split of the goes between gathering and making, keep the best
  let best = 0
  for (let share = 0.2; share <= 1.0001; share += 0.05) {
    let gatherGoes = goes * share
    if (capped) gatherGoes = Math.min(gatherGoes, chainCapacity(c))
    const laterGoes = c.later && g >= LIFE_FINAL ? Math.min(gatherGoes * 0.1, capped ? LATER_SPOT.max + MINUTES / LATER_SPOT.regen : Infinity) : 0
    const have: Partial<Record<ItemId, number>> = {}
    for (const [id, n] of Object.entries(per) as [ItemId, number][]) have[id] = n * (gatherGoes - laterGoes)
    if (c.later && laterGoes) have[c.later] = (have[c.later] ?? 0) + laterGoes * (1 + perGoAbove8(g))
    let craftGoes = goes * (1 - share),
      gold = 0
    for (const r of recipes) {
      // the gathered inputs limit how many; bought inputs are paid for at the shop
      let n = craftGoes
      for (const i of r.inputs) if (per[i.item] !== undefined || i.item === c.later) n = Math.min(n, (have[i.item] ?? 0) / i.count)
      // what is neither gathered here nor on a shop's shelf cannot be had
      if (r.inputs.some((i) => per[i.item] === undefined && i.item !== c.later && !SOLD.has(i.item))) continue
      if (n <= 0) continue
      const cost = r.inputs.reduce((a, i) => a + (per[i.item] !== undefined || i.item === c.later ? 0 : priceOf(i.item, 1) * i.count), 0) + fee(r.station)
      const ok = 1 - failChance(k, r.min)
      const worth = sale(r.output.item) * r.output.count * ok * (ITEMS[r.output.item].made ? qualityPrice(k) : 1)
      // a made input (blue potion, honey cake) is bought; only worth it when the thing sells for more
      if (worth <= cost) continue
      for (const i of r.inputs) if (have[i.item] !== undefined) have[i.item]! -= n * i.count
      gold += n * (worth - cost)
      craftGoes -= n
    }
    // what is left over is sold as it is
    for (const [id, n] of Object.entries(have) as [ItemId, number][]) gold += Math.max(0, n) * sale(id)
    const stamina = gatherGoes * cold + (goes * (1 - share) - craftGoes) * STAMINA_PER_CRAFT
    gold -= stamina * bestFood().perPoint
    best = Math.max(best, gold)
  }
  return best
}

/** A: three chains, six skills, the ceiling spread evenly; seven places a night. B: one chain at 64, three places. */
function finalA(total: number, capped: boolean): { gold: number; levels: Levels } {
  const skills = CHAINS.flatMap((c) => [c.gather, c.craft])
  const levels: Levels = {}
  skills.forEach((s, i) => {
    levels[s] = Math.min(LIFE_FINAL, Math.floor(total / skills.length) + (i < total % skills.length ? 1 : 0))
  })
  const goes = ((MINUTES - 7 * TRAVEL_PER_PLACE) * 60) / GO_SECONDS / CHAINS.length
  return { gold: Math.round(CHAINS.reduce((a, c) => a + runChain(c, levels[c.gather]!, levels[c.craft]!, goes, capped), 0)), levels }
}
function finalB(capped: boolean): { gold: number; chain: Chain } {
  const goes = ((MINUTES - 3 * TRAVEL_PER_PLACE) * 60) / GO_SECONDS
  return CHAINS.map((c) => ({ gold: Math.round(runChain(c, LIFE_FINAL, LIFE_FINAL, goes, capped)), chain: c })).sort((a, b) => b.gold - a.gold)[0]
}

const SKILL_NAMES: Record<string, string> = { ...NAMES, alchemy: "調合" }
out.push(
  `**最終（一つ ${LIFE_FINAL} まで）での合計の上限**: 節目 16・32・64 の品（§2.1）を入れて、採って作って取引所で売る三つの流れ（木こり→木工、採取→調合、釣り→料理）で比べる。A は合計を六つに均等に割って三つとも回す。B は一つの流れを ${LIFE_FINAL} まで上げる（いちばん稼げる流れを選ぶ）。`,
  "",
  "| 合計の上限 | A の生活スキル | A の一晩 | B の一晩 | B ÷ A | A（場所で頭打ち） | B（場所で頭打ち） | B ÷ A |",
  "|---|---|---|---|---|---|---|---|",
)
let best = 0,
  bestCapped = 0
const b = finalB(false),
  bc = finalB(true)
for (const total of [48, 64, 96, 128, 160, 192, 256, 384]) {
  const a = finalA(total, false),
    ac = finalA(total, true)
  const r = b.gold / Math.max(1, a.gold),
    rc = bc.gold / Math.max(1, ac.gold)
  if (r >= 1.5 && total >= 2 * LIFE_FINAL) best = total
  if (rc >= 1.5 && total >= 2 * LIFE_FINAL) bestCapped = total
  out.push(`| ${total} | ${show(a.levels, SKILL_NAMES)} | ${a.gold}G | ${b.gold}G | ${r.toFixed(2)} | ${ac.gold}G | ${bc.gold}G | ${rc.toFixed(2)} |`)
}
out.push(
  "",
  `B がいちばん稼げる流れ: 場所の量を数えないと「${b.chain.name}」、数えると「${bc.chain.name}」。`,
  `B が A の 1.5 倍を保つ、いちばん高い合計（専門の流れ一つを上げきれる ${2 * LIFE_FINAL} 以上で）: 場所の量を数えないと ${best || "なし"}、数えると ${bestCapped || "なし"}。`,
)
console.log(out.join("\n"))
