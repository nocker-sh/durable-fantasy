import { describe, expect, it } from "vitest"
import { RESIDENTS } from "#/world/town/residents"
import { HOUSEHOLDS } from "#/world/town/houses"
import { householdOf as household } from "#/world/town/household-of"
import { APART, PEOPLE, RELATIONS } from "#/world/town/people"
import { MAPS } from "#/world/maps"
import { npcsAt } from "#/world/maps/npcs-at"

const ageOf = (name: string) => RESIDENTS.find((r) => r.name === name)?.look.age ?? "adult"
const householdOf = (name: string) => household(name)?.id

describe("people and how they stand with each other", () => {
  it("everyone has a character, a way of talking and a phrase of their own", () => {
    for (const r of RESIDENTS) {
      const p = PEOPLE[r.name]
      expect(p, r.name).toBeDefined()
      expect(p.traits.length, r.name).toBeGreaterThanOrEqual(2)
      expect(p.speech.length, r.name).toBeGreaterThan(0)
    }
  })

  it("relations are between real residents, each pair named once", () => {
    const names = new Set(RESIDENTS.map((r) => r.name))
    const pairs = new Set<string>()
    for (const rel of RELATIONS) {
      expect(names.has(rel.a), rel.a).toBe(true)
      expect(names.has(rel.b), rel.b).toBe(true)
      expect(rel.a).not.toBe(rel.b)
      const key = [rel.a, rel.b].sort().join("/")
      expect(pairs.has(key), key).toBe(false)
      pairs.add(key)
    }
  })

  it("families live together, and parents, children and grandparents have the right ages", () => {
    for (const rel of RELATIONS) {
      if (["夫婦", "親子", "姉妹", "兄妹", "兄弟", "祖父と孫", "祖母と孫"].includes(rel.kind)) expect(householdOf(rel.a), `${rel.a}/${rel.b}`).toBe(householdOf(rel.b))
      if (rel.kind === "夫婦") {
        expect(ageOf(rel.a)).not.toBe("child")
        expect(ageOf(rel.b)).not.toBe("child")
      }
      if (rel.kind === "親子") expect(ageOf(rel.a), `${rel.a} is ${rel.b}'s parent`).not.toBe("child")
      if (rel.kind === "祖父と孫" || rel.kind === "祖母と孫") expect(ageOf(rel.a), `${rel.a} is ${rel.b}'s grandparent`).toBe("old")
      if (rel.kind === "師弟") expect(ageOf(rel.a)).not.toBe("child")
    }
  })

  it("everyone in a household of several is family or otherwise bound to the others", () => {
    for (const hh of HOUSEHOLDS) {
      if (hh.members.length < 2) continue
      for (const m of hh.members) {
        const bound = RELATIONS.some((r) => (r.a === m && hh.members.includes(r.b)) || (r.b === m && hh.members.includes(r.a)))
        expect(bound, `${hh.id}: ${m}`).toBe(true)
      }
    }
  })

  it("nobody is alone in the world: everyone has someone", () => {
    for (const r of RESIDENTS)
      expect(
        RELATIONS.some((rel) => rel.a === r.name || rel.b === r.name),
        r.name,
      ).toBe(true)
  })

  it("families, friends and old acquaintances meet somewhere in the day, except the pairs apart on purpose", () => {
    // who is on each map, every quarter hour, worked out once
    const crowds: Set<string>[] = []
    for (let m = 0; m < 1440; m += 15) for (const map of Object.values(MAPS)) crowds.push(new Set(npcsAt(map, m).map((n) => n.name)))
    const together = (a: string, b: string) => crowds.some((c) => c.has(a) && c.has(b))
    const close = RELATIONS.filter((r) => !["取引相手", "ぎこちない"].includes(r.kind))
    for (const r of close) {
      const apart = APART.some((p) => (p.a === r.a && p.b === r.b) || (p.a === r.b && p.b === r.a))
      expect(together(r.a, r.b), `${r.a}・${r.b}（${r.kind}）${apart ? " is listed as apart" : ""}`).toBe(!apart)
    }
  }, 30_000)
})
