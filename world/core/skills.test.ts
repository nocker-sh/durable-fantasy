import { describe, expect, it } from "vitest"
import { apply } from "./apply"
import { countItem } from "#/world/core/count-item"
import { startingStats } from "#/world/core/starting-stats"
import { lifeExpAt } from "#/world/core/life-exp-at"
import { emptyEquipment } from "#/world/core/empty-equipment"
import { SKILLS } from "#/world/core/skills"
import { SKILL_IDS } from "#/world/core/skill-ids"
import { artBlocked } from "#/world/core/art-blocked"
import { artsOf } from "#/world/core/arts-of"
import { firstAid } from "#/world/core/first-aid"
import { isArt } from "#/world/core/is-art"
import { skillOf } from "#/world/core/skill-of"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"
import { commandSchema } from "./commands"

const holding = (weapon: "wood-axe" | "oak-staff" | "dagger", patch: Parameters<typeof player>[0] = {}) => player({ equipment: { ...emptyEquipment(), weapon }, ...patch })

describe("what anyone can do", () => {
  it("sits down to rest without learning anything, and a blow gets them up", () => {
    const sat = apply(player(), { type: "sit" }, { now: 2 })
    expect(sat.ok && sat.state.sitting).toBe(true)
    const hit = sat.ok ? apply(sat.state, { type: "hurt", amount: 1, by: "スライム" }, { now: 3 }) : sat
    expect(hit.ok && hit.state.sitting).toBe(false)
  })

  it("first aid takes a herb and SP, better with alchemy; not without a herb, at full HP or during the wait", () => {
    const p = player({ hp: 10, sp: 5, bag: bagWith(["herb", 2]) })
    const r = apply(p, { type: "cast", skill: "first-aid" }, { now: 1000 })
    expect(r.ok && r.state.hp).toBe(10 + firstAid(0, p.stats.vit))
    expect(r.ok && r.state.sp).toBe(5 - SKILLS["first-aid"].sp)
    expect(r.ok && countItem(r.state.bag, "herb")).toBe(1)
    expect(r.ok && apply(r.state, { type: "cast", skill: "first-aid" }, { now: 2000 })).toEqual({ ok: false, reason: "COOLDOWN" })
    expect(apply({ ...p, sp: 2 }, { type: "cast", skill: "first-aid" }, { now: 1000 })).toEqual({ ok: false, reason: "SP_SHORT" })
    expect(apply(player({ hp: 10 }), { type: "cast", skill: "first-aid" }, { now: 1000 })).toEqual({ ok: false, reason: "NO_HERB" })
    // a practised hand at the hearth binds a wound better than a herb chewed as it is
    expect(firstAid(8, 5)).toBeGreaterThan(firstAid(0, 5))
    expect(firstAid(0, 5)).toBeGreaterThan(15)
  })
})

describe("arts come with the weapon in hand", () => {
  it("the woodcutter's chop needs the axe held, the arm and the practice", () => {
    const wood = (lv: number) => ({ ...player().life, woodcutting: lifeExpAt(lv) })
    expect(artBlocked("chop", player())).toBe("NO_WEAPON")
    expect(artBlocked("chop", holding("wood-axe", { life: wood(4) }))).toBe("STAT_TOO_LOW")
    expect(artBlocked("chop", holding("wood-axe", { stats: { ...startingStats(), str: 8 }, life: wood(3) }))).toBe("SKILL_TOO_LOW")
    expect(artBlocked("chop", holding("wood-axe", { stats: { ...startingStats(), str: 8 }, life: wood(4) }))).toBeNull()
    // the bigger one at the next milestone
    expect(artBlocked("fell", holding("wood-axe", { stats: { ...startingStats(), str: 12 }, life: wood(4) }))).toBe("SKILL_TOO_LOW")
    expect(artsOf("wood-axe")).toEqual(["chop", "fell"])
  })

  it("paying for a blow takes SP and starts the wait; the room rolls it", () => {
    const p = holding("dagger", { stats: { ...startingStats(), dex: 9 }, sp: 10 })
    const r = apply(p, { type: "art", skill: "pierce" }, { now: 1000 })
    expect(r.ok && r.state.sp).toBe(10 - SKILLS.pierce.sp)
    expect(r.ok && apply(r.state, { type: "art", skill: "pierce" }, { now: 2000 })).toEqual({ ok: false, reason: "COOLDOWN" })
    expect(apply(p, { type: "art", skill: "kodama" }, { now: 1000 })).toEqual({ ok: false, reason: "NOT_USABLE" })
  })

  it("the woodcutter's prayer heals with faith, from a staff, for one with the practice", () => {
    const p = holding("oak-staff", { hp: 10, sp: 20, stats: { ...startingStats(), fth: 9 }, life: { ...player().life, woodcutting: lifeExpAt(4) } })
    const r = apply(p, { type: "cast", skill: "kodama" }, { now: 1000 })
    expect(r.ok && r.state.hp).toBe(10 + 10 + 2 * 9)
    expect(apply({ ...p, life: player().life }, { type: "cast", skill: "kodama" }, { now: 1000 })).toEqual({ ok: false, reason: "SKILL_TOO_LOW" })
    expect(apply(p, { type: "cast", skill: "ember" }, { now: 1000 })).toEqual({ ok: false, reason: "NOT_USABLE" })
  })

  it("a skill can sit on the shortcut bar; nonsense cannot", () => {
    const r = apply(player(), { type: "hotbar", index: 3, item: "skill:chop" })
    expect(r.ok && r.state.hotbar[3]).toBe("skill:chop")
    expect(commandSchema.safeParse({ type: "hotbar", index: 3, item: "skill:sit" }).success).toBe(true)
    expect(commandSchema.safeParse({ type: "hotbar", index: 3, item: "skill:basic" }).success).toBe(false)
    expect(commandSchema.safeParse({ type: "learn", skill: "sit" }).success).toBe(false)
  })
})

it("indexes every weapon art in definition order and shares immutable lists", () => {
  const weapons = new Set(
    SKILL_IDS.flatMap((id) => {
      const skill = skillOf(id)
      return isArt(skill) ? [...skill.weapons] : []
    }),
  )
  for (const weapon of weapons) {
    const expected = SKILL_IDS.filter((id) => {
      const skill = skillOf(id)
      return isArt(skill) && skill.weapons.includes(weapon)
    })
    expect(artsOf(weapon)).toEqual(expected)
    expect(artsOf(weapon)).toBe(artsOf(weapon))
    expect(Object.isFrozen(artsOf(weapon))).toBe(true)
  }
  expect(artsOf(null)).toEqual([])
  expect(artsOf("herb")).toBe(artsOf(null))
})
