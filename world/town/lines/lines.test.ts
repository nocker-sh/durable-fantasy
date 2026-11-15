import { describe, expect, it } from "vitest"
import { phase } from "#/world/core/phase"
import type { Phase } from "#/world/core/clock-types"
import { RESIDENTS } from "#/world/town/residents"
import { fit } from "#/world/town/lines/fit"
import { pick } from "#/world/town/lines/pick"
import type { Line, Situation } from "#/world/town/lines/line"
import { ALL_LINES } from "#/world/town/lines/index"
import { APART, RELATIONS } from "#/world/town/people"
import { ROUTINES } from "#/world/town/routines"
import { slotAt } from "#/world/town/slot-at"

const EVERY = Array.from({ length: 96 }, (_, k) => k * 15)
const asleep = (name: string, m: number) => {
  const s = slotAt(name, ((m % 1440) + 1440) % 1440)
  return s?.where === "home" && s.doing.includes("眠")
}
const all = Object.entries(ALL_LINES).flatMap(([name, lines]) => lines.map((l) => ({ name, l })))

describe("what residents say", () => {
  it("everyone has plenty to say", () => {
    for (const r of RESIDENTS) expect(ALL_LINES[r.name]?.length ?? 0, r.name).toBeGreaterThanOrEqual(40)
  })

  it("no line is said twice, by anyone, and none runs long", () => {
    const seen = new Map<string, string>()
    for (const { name, l } of all) {
      expect(seen.get(l.text), `${name}: ${l.text}`).toBeUndefined()
      seen.set(l.text, name)
      expect(l.text.length, l.text).toBeLessThanOrEqual(60)
    }
  })

  it("keeps to the world: a town, the goddess and her monk, no strangers called travellers", () => {
    for (const { name, l } of all) for (const bad of [/村/, /旅の人/, /旅のお方/, /神父/, /商会/, /自治会/, /銅貨/, /弁当/, /天国/]) expect(bad.test(l.text), `${name}: ${l.text}`).toBe(false)
  })

  it("speaks of people nearby only if they know them, and of doings that are theirs", () => {
    for (const { name, l } of all) {
      if (l.near)
        expect(
          RELATIONS.some((r) => (r.a === name && r.b === l.near) || (r.b === name && r.a === l.near)),
          `${name} → ${l.near}`,
        ).toBe(true)
      if (l.doing)
        expect(
          (ROUTINES[name] ?? []).some((s) => s.doing.includes(l.doing!)),
          `${name}: doing ${l.doing}`,
        ).toBe(true)
    }
  })

  it("a line for a time of day is for a time they are up", () => {
    for (const { name, l } of all) {
      if (!l.phase) continue
      const up = (p: Phase) => EVERY.some((m) => phase(m) === p && !asleep(name, m))
      expect(l.phase.some(up), `${name} [${l.phase}]: ${l.text}`).toBe(true)
    }
  })

  it("a line for a time of day or a doing can be heard: they are out of doors then, not at home out of sight", () => {
    const heard = (name: string, l: Line) =>
      EVERY.some((m) => {
        const s = slotAt(name, m)
        return !!s && s.where !== "home" && (!l.phase || l.phase.includes(phase(m))) && (!l.doing || s.doing.includes(l.doing))
      })
    const unheard = all.filter((x) => (x.l.phase || x.l.doing) && !heard(x.name, x.l)).map((x) => `${x.name} [${x.l.phase ?? x.l.doing}]: ${x.l.text}`)
    expect(unheard).toEqual([])
  })

  it("good morning is said by someone just up, at the part of the day they get up", () => {
    for (const { name, l } of all) {
      if (!/^おはよう(?!、か)/.test(l.text)) continue // a greeting of their own, not one they answer
      expect(l.phase ?? l.doing, `${name}: ${l.text} needs a time of day or a doing`).toBeDefined()
      const when = (m: number) => (l.phase ? l.phase.includes(phase(m)) : true) && (l.doing ? !!slotAt(name, m)?.doing.includes(l.doing) : true)
      const justUp = EVERY.some((m) => when(m) && !asleep(name, m) && [60, 120, 180, 240, 300].some((d) => asleep(name, m - d)))
      expect(justUp, `${name} [${l.phase}]: ${l.text}`).toBe(true)
    }
  })

  it("every doing out of doors has a line of its own, so nobody at work only makes small talk", () => {
    for (const r of RESIDENTS) {
      const lines = ALL_LINES[r.name] ?? []
      const doings = new Set((ROUTINES[r.name] ?? []).filter((s) => s.where !== "home").map((s) => s.doing))
      for (const d of doings) expect(lines.some((l) => l.doing && d.includes(l.doing)), `${r.name}: ${d}`).toBe(true)
    }
  })

  it("names only people and things of this town: a name in katakana is a resident, an animal or a known word", () => {
    const names = new Set(RESIDENTS.map((r) => r.name))
    // animals the residents have named, the two other towns, and the everyday words written in katakana
    const known = new Set([
      ...["フロッケ", "ブレッセ", "ヴォルケ", "フレッケ", "シュネー", "クレー", "グルンツ", "シュヌッフェル", "クノレ"],
      ...["クイニョン"],
      ...["インク", "カミツレ", "カラーン", "キャベツ", "グラス", "ケンカ", "ケーキ", "ゴールド", "シチュー", "シーツ", "スカーフ", "スキップ"],
      ...["ストール", "スライム", "スープ", "ズボン", "ゼリー", "タマネギ", "チクチク", "チーズ", "トネリコ", "ドレス", "ニシン", "ニンジン"],
      ...["ハリネズミ", "バター", "ピンク", "ベンチ", "ベーコン", "ページ", "ボタン", "ポケット", "マフラー", "ミミズ", "ランタン", "ラード", "リボン"],
    ])
    for (const { name, l } of all)
      for (const m of l.text.matchAll(/[ァ-ヴー]{3,}/g)) expect(names.has(m[0]) || known.has(m[0]), `${name}: ${m[0]} in 「${l.text}」`).toBe(true)
  })

  it("the festival of lights comes every month, so nobody calls it a yearly thing", () => {
    for (const { name, l } of all)
      if (l.event === "灯りの祭り" || l.event === "祭りの前日") expect(/毎年|年に一度|一年で|一年に/.test(l.text), `${name}: ${l.text}`).toBe(false)
  })

  it("pairs kept apart on purpose have no line for standing next to each other", () => {
    for (const { name, l } of all)
      if (l.near) expect(APART.some((p) => (p.a === name && p.b === l.near) || (p.b === name && p.a === l.near)), `${name} → ${l.near}`).toBe(false)
  })

  it("keeps to what the world is: ash that started long before anyone alive, crystals that are not used up, no orphanage", () => {
    for (const { name, l } of all) for (const bad of [/孤児院/, /結晶(が|は|を)?(減|すり減|使い切|なくな)/, /灰が降り始めた頃/]) expect(bad.test(l.text), `${name}: ${l.text}`).toBe(false)
  })

  it("the best-fitting line comes first, and a conversation never repeats itself", () => {
    const s: Situation = { phase: "夜", doing: "夜市で揚げ菓子を売る", nearby: new Set(), friend: 0, event: "寒波", firstTime: false }
    const pages = pick({ lines: ALL_LINES["エルザ"], s: s, pages: 3, seed: 7 })
    expect(new Set(pages).size).toBe(pages.length)
    const top = ALL_LINES["エルザ"].find((l) => l.text === pages[0])!
    expect(fit(top, s)).toBeGreaterThan(0)
  })
})
