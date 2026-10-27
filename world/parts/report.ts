// What the player is told when something happens to them (core/commands.ts GameEvent): a notice,
// and for money changing hands a line in the log.
import { formatTime, jstMinutes } from "../core/clock.ts"
import { COMMISSIONS } from "../core/commissions.ts"
import { REASON_TEXT, type GameEvent, type Reason } from "../core/commands.ts"
import { RECIPES } from "../core/crafting.ts"
import { errandLabel, errandOf } from "../core/errands.ts"
import { STAT_NAME } from "../core/growth.ts"
import { GATHER_SKILL_NAME, ITEMS, QUALITIES, type ItemId } from "../core/items.ts"
import { LIFE_CAP, MILESTONES } from "../core/life.ts"
import { displayName } from "../core/makers.ts"
import { MONSTER_KINDS, spawnOf } from "../core/monsters.ts"
import { SKILLS } from "../core/skills.ts"
import type { Notice } from "../state.ts"

export interface Told {
  notices: { text: string; tone: Notice["tone"] }[]
  chat: string[]
}

/** A life skill's level going up, as a note after the event's own (a milestone said so). */
function lifeUp(e: { skill: keyof typeof GATHER_SKILL_NAME; level: number; up: boolean }): string {
  if (!e.up) return ""
  const milestone = (MILESTONES as readonly number[]).includes(e.level) ? "（節目。できることが増えた）" : ""
  return ` ${GATHER_SKILL_NAME[e.skill]}が Lv ${e.level}${e.level >= LIFE_CAP ? "（いまの上限）" : ""}に上がった${milestone}。`
}

export function tell(event: GameEvent, me: string | undefined): Told {
  const out: Told = { notices: [], chat: [] }
  const notify = (text: string, tone: Notice["tone"] = "info") => out.notices.push({ text, tone })
  const chat = (text: string) => out.chat.push(text)
  const name = (id: ItemId, by?: string) => displayName(id, by)
  switch (event.type) {
    case "looted": {
      const what = event.items.map((i) => ITEMS[i].name).join("、")
      notify(`${MONSTER_KINDS[spawnOf(event.monster)?.kind ?? "slime"].name}を追い払った。経験値 +${event.exp}${what ? `、${what}を拾った` : ""}。`, "good")
      if (event.gained) notify(`レベルが ${event.level} に上がった！`, "good")
      return out
    }
    case "escrowed":
      if (event.item) notify(`${name(event.item, event.by)}を掲示板に出した（出品料 ${event.gold}G）。`, "good")
      else notify(`代金 ${event.gold}G を掲示板に預けた。`, "good")
      return out
    case "received":
      notify(`掲示板から受け取った: ${event.gold}G、品物 ${event.items}個。`, "good")
      return out
    case "shared":
      notify(`仲間が${MONSTER_KINDS[spawnOf(event.monster)?.kind ?? "slime"].name}を追い払った。経験値 +${event.exp}。`, "good")
      if (event.gained) notify(`レベルが ${event.level} に上がった！`, "good")
      return out
    case "threaded":
      notify(`${event.name}とマフラーの糸を交換した。糸をたどれば、その人の町へ行ける。`, "good")
      return out
    case "partied":
    case "sat":
    case "stood":
      return out
    case "cast":
      notify(`${SKILLS[event.skill].name}。HP が ${event.hp} 戻った。`, "good")
      return out
    case "art":
      notify(`${SKILLS[event.skill].name}！`, "good")
      return out
    case "traded-in":
    case "traded-out":
      return out
    case "stored":
      notify(`${name(event.item, event.by)}×${event.count}を預けた（預かり賃 ${event.fee}G）。`, "good")
      return out
    case "retrieved":
      notify(`${name(event.item, event.by)}×${event.count}を引き取った。`, "good")
      return out
    case "fell":
      notify(`${event.by}に叩き返されて、倒れた。`, "bad")
      return out
    case "revived":
      notify(event.lost ? `町で気がついた。経験値を ${event.lost} 失った。` : "町で気がついた。", "good")
      return out
    case "hurt":
      return out
    case "errand-taken": {
      const e = errandOf(event.errand)
      if (e) notify(`頼まれごとを引き受けた: ${errandLabel(e)}`, "good")
      return out
    }
    case "errand-done": {
      const known = Object.entries(event.friends)
        .map(([n, f]) => `${n} ${f}`)
        .join("、")
      notify(`頼まれごとを済ませた。${event.gold}G を受け取った（親しさ: ${known}）。`, "good")
      return out
    }
    case "ordered": {
      const job = COMMISSIONS.find((c) => c.id === event.commission)
      if (job) notify(`${job.craftsman}に${ITEMS[job.output.item].name}を頼んだ。${formatTime(jstMinutes(event.readyAt))}ごろにできる。`, "good")
      return out
    }
    case "collected":
      notify(`${name(event.item, event.q !== null ? event.by : undefined)}${event.q !== null ? `（${QUALITIES[event.q]}）` : ""}を受け取った。`, "good")
      return out
    case "spoiled": {
      const rec = RECIPES.find((r) => r.id === event.recipe)
      notify(`${rec ? ITEMS[rec.output.item].name : "それ"}を作りそこねた。材料は無駄になった。${lifeUp(event)}`, "bad")
      return out
    }
    case "crafted":
      notify(`${name(event.item, event.q !== null ? me : undefined)}${event.q !== null ? `（${QUALITIES[event.q]}）` : ""}を${event.count}個作った。${lifeUp(event)}`, "good")
      return out
    case "gathered":
      notify(`${name(event.item)}を${event.count}個手に入れた。${lifeUp(event)}`, "good")
      if (event.broke) notify(`${name(event.broke)}が壊れた。`, "bad")
      return out
    case "tired":
      return out
    case "bought":
      notify(`${name(event.item, event.by)}を${event.count}個買った。`, "good")
      chat(`${name(event.item, event.by)}を${event.count}個買った（${event.cost}G）。`)
      return out
    case "sold":
      notify(`${name(event.item)}を${event.count}個売った。`, "good")
      chat(`${name(event.item)}を${event.count}個売った（${event.gain}G）。`)
      return out
    case "used":
      notify(
        `${name(event.item, event.by)}を${ITEMS[event.item].use?.full ? "食べた" : "使った"}。${[event.hp ? `HP +${event.hp}` : "", event.sp ? `SP +${event.sp}` : "", event.stamina ? `スタミナ +${event.stamina}` : "", event.warm ? `体が温まった（${event.warm}分）` : "", event.focus ? `集中（${event.focus}分）` : ""].filter(Boolean).join(" ")}`,
        "good",
      )
      return out
    case "equipped":
      notify(`${name(event.item)}を装備した。`, "good")
      return out
    case "unequipped":
      notify(`${name(event.item)}を外した。`)
      return out
    case "raised":
      notify(`${STAT_NAME[event.stat]}が ${event.value} になった。`, "good")
      return out
    case "renamed":
      chat(`名前と見た目を変えた（${event.name}）。`)
      return out
    case "rearranged":
      return out
  }
  return out
}

/** Why a muffler-thread swap did not happen. */
export const threadClosedText = (reason: string) => (reason === "TOO_FAR" ? "もっと近くに寄らないと。" : "糸の交換を断られた。")

/** Why an invitation into a party did not work. */
export function partyClosedText(reason: string): string {
  const text: Record<string, string> = { DECLINED: "パーティの誘いを断られた。", BUSY: "今は誘えない。", NOT_LEADER: "誘えるのはリーダーだけ。", FULL: "パーティはもう一杯だ。" }
  return text[reason] ?? "誘えなかった。"
}

/** How a face-to-face trade ended. */
export function tradeClosedText(reason: string): string {
  const text: Record<string, string> = {
    DONE: "取引が成立した。",
    PENDING: "取引結果を確認できなかった。少し待ってから町に入り直し、持ち物を確認してね。",
    DECLINED: "取引を断られた。",
    CANCELLED: "取引をやめた。",
    LEFT: "相手がいなくなった。",
    BUSY: "今は取引できない。",
    TOO_FAR: "もっと近くに寄らないと。",
  }
  return text[reason] ?? (reason in REASON_TEXT ? `取引できなかった: ${REASON_TEXT[reason as Reason]}` : "取引できなかった。")
}
