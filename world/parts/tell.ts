import { formatTime } from "#/world/core/format-time"
import { jstMinutes } from "#/world/core/jst-minutes"
import { COMMISSIONS } from "#/world/core/commissions"
import type { GameEvent } from "#/world/core/commands"
import { RECIPES } from "#/world/core/recipes/catalog"
import { errandLabel } from "#/world/core/errand-label"
import { errandOf } from "#/world/core/errand-of"
import { STAT_NAME } from "#/world/core/growth-rules"
import { QUALITIES } from "#/world/core/items/kinds"
import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import { displayName } from "#/world/core/display-name"
import { MONSTER_KINDS } from "#/world/core/monsters"
import { spawnOf } from "#/world/core/spawn-of"
import { SKILLS } from "#/world/core/skills"
import type { Notice } from "#/world/state"
import type { Told } from "#/world/parts/report"
import { lifeUp } from "#/world/parts/life-up"

export function tell(event: GameEvent, me: string | undefined): Told {
  const out: Told = { notices: [], chat: [] }
  const notify = (text: string, tone: Notice["tone"] = "info") => out.notices.push({ text, tone })
  const chat = (text: string) => out.chat.push(text)
  const name = (id: ItemId, by?: string) => displayName(id, by)
  if (event.type === "looted") {
    const what = event.items.map((i) => ITEMS[i].name).join("、")
    notify(`${MONSTER_KINDS[spawnOf(event.monster)?.kind ?? "slime"].name}を追い払った。経験値 +${event.exp}${what ? `、${what}を拾った` : ""}。`, "good")
    if (event.gained) notify(`レベルが ${event.level} に上がった！`, "good")
    return out
  }
  if (event.type === "escrowed") {
    if (event.item) notify(`${name(event.item, event.by)}を掲示板に出した（出品料 ${event.gold}G）。`, "good")
    else notify(`代金 ${event.gold}G を掲示板に預けた。`, "good")
    return out
  }
  if (event.type === "received") {
    notify(`掲示板から受け取った: ${event.gold}G、品物 ${event.items}個。`, "good")
    return out
  }
  if (event.type === "shared") {
    notify(`仲間が${MONSTER_KINDS[spawnOf(event.monster)?.kind ?? "slime"].name}を追い払った。経験値 +${event.exp}。`, "good")
    if (event.gained) notify(`レベルが ${event.level} に上がった！`, "good")
    return out
  }
  if (event.type === "threaded") {
    notify(`${event.name}とマフラーの糸を交換した。糸をたどれば、その人の町へ行ける。`, "good")
    return out
  }
  if (event.type === "partied" || event.type === "sat" || event.type === "stood") {
    return out
  }
  if (event.type === "cast") {
    notify(`${SKILLS[event.skill].name}。HP が ${event.hp} 戻った。`, "good")
    return out
  }
  if (event.type === "art") {
    notify(`${SKILLS[event.skill].name}！`, "good")
    return out
  }
  if (event.type === "traded-in" || event.type === "traded-out") {
    return out
  }
  if (event.type === "stored") {
    notify(`${name(event.item, event.by)}×${event.count}を預けた（預かり賃 ${event.fee}G）。`, "good")
    return out
  }
  if (event.type === "retrieved") {
    notify(`${name(event.item, event.by)}×${event.count}を引き取った。`, "good")
    return out
  }
  if (event.type === "fell") {
    notify(`${event.by}に叩き返されて、倒れた。`, "bad")
    return out
  }
  if (event.type === "revived") {
    notify(event.lost ? `町で気がついた。経験値を ${event.lost} 失った。` : "町で気がついた。", "good")
    return out
  }
  if (event.type === "hurt") {
    return out
  }
  if (event.type === "errand-taken") {
    const e = errandOf(event.errand)
    if (e) notify(`頼まれごとを引き受けた: ${errandLabel(e)}`, "good")
    return out
  }
  if (event.type === "errand-done") {
    const known = Object.entries(event.friends)
      .map((entry) => `${entry[0]} ${entry[1]}`)
      .join("、")
    notify(`頼まれごとを済ませた。${event.gold}G を受け取った（親しさ: ${known}）。`, "good")
    return out
  }
  if (event.type === "ordered") {
    const job = COMMISSIONS.find((c) => c.id === event.commission)
    if (job) notify(`${job.craftsman}に${ITEMS[job.output.item].name}を頼んだ。${formatTime(jstMinutes(event.readyAt))}ごろにできる。`, "good")
    return out
  }
  if (event.type === "collected") {
    notify(`${name(event.item, event.q !== null ? event.by : undefined)}${event.q !== null ? `（${QUALITIES[event.q]}）` : ""}を受け取った。`, "good")
    return out
  }
  if (event.type === "spoiled") {
    const rec = RECIPES.find((r) => r.id === event.recipe)
    notify(`${rec ? ITEMS[rec.output.item].name : "それ"}を作りそこねた。材料は無駄になった。${lifeUp(event)}`, "bad")
    return out
  }
  if (event.type === "crafted") {
    notify(`${name(event.item, event.q !== null ? me : undefined)}${event.q !== null ? `（${QUALITIES[event.q]}）` : ""}を${event.count}個作った。${lifeUp(event)}`, "good")
    return out
  }
  if (event.type === "gathered") {
    notify(`${name(event.item)}を${event.count}個手に入れた。${lifeUp(event)}`, "good")
    if (event.broke) notify(`${name(event.broke)}が壊れた。`, "bad")
    return out
  }
  if (event.type === "tired") {
    return out
  }
  if (event.type === "bought") {
    notify(`${name(event.item, event.by)}を${event.count}個買った。`, "good")
    chat(`${name(event.item, event.by)}を${event.count}個買った（${event.cost}G）。`)
    return out
  }
  if (event.type === "sold") {
    notify(`${name(event.item)}を${event.count}個売った。`, "good")
    chat(`${name(event.item)}を${event.count}個売った（${event.gain}G）。`)
    return out
  }
  if (event.type === "used") {
    notify(
      `${name(event.item, event.by)}を${ITEMS[event.item].use?.full ? "食べた" : "使った"}。${[event.hp ? `HP +${event.hp}` : "", event.sp ? `SP +${event.sp}` : "", event.stamina ? `スタミナ +${event.stamina}` : "", event.warm ? `体が温まった（${event.warm}分）` : "", event.focus ? `集中（${event.focus}分）` : ""].filter(Boolean).join(" ")}`,
      "good",
    )
    return out
  }
  if (event.type === "equipped") {
    notify(`${name(event.item)}を装備した。`, "good")
    return out
  }
  if (event.type === "unequipped") {
    notify(`${name(event.item)}を外した。`)
    return out
  }
  if (event.type === "raised") {
    notify(`${STAT_NAME[event.stat]}が ${event.value} になった。`, "good")
    return out
  }
  if (event.type === "renamed") {
    chat(`名前と見た目を変えた（${event.name}）。`)
    return out
  }
  if (event.type === "rearranged") {
    return out
  }
  return out
}
