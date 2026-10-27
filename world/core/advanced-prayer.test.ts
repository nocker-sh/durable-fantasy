import { expect, it } from "vitest"
import { apply } from "./apply"
import { commandSchema } from "./commands"
import { lifeExpAt } from "./life"
import { emptyEquipment, loadPlayer } from "./player"
import { artBlocked, artsOf, SKILLS } from "./skills"
import { derive } from "./stats"
import { bagWith, player } from "../test/helpers"

const caster = () =>
  player({
    name: "エルナ",
    hp: 1,
    sp: 60,
    stats: { ...player().stats, vit: 16, mnd: 14, fth: 16 },
    equipment: { ...emptyEquipment(), weapon: "amber-staff" },
  })

it("crafts an advanced staff and persists its stronger prayer on the shortcut bar", () => {
  const before = caster()
  const made = apply(
    { ...before, equipment: emptyEquipment(), life: { ...before.life, carpentry: lifeExpAt(32) }, bag: bagWith(["black-oak-heart", 1], ["amber-resin", 2], ["small-crystal", 1]) },
    { type: "craft", recipe: "amber-staff", station: "workshop-bench", roll: 0.5 },
    { now: 1000 },
  )
  if (!made.ok) throw Error(made.reason)
  const slot = made.state.bag.findIndex((s) => s?.item === "amber-staff")
  const equipped = apply(made.state, { type: "equip", slot }, { now: 1000 })
  if (!equipped.ok) throw Error(equipped.reason)
  expect(artsOf(equipped.state.equipment.weapon)).toContain("solace")
  const bound = apply(equipped.state, commandSchema.parse({ type: "hotbar", index: 2, item: "skill:solace" }), { now: 1000 })
  if (!bound.ok) throw Error(bound.reason)
  const used = apply(bound.state, { type: "cast", skill: "solace" }, { now: 1000 })
  if (!used.ok) throw Error(used.reason)
  expect(used.events).toContainEqual({ type: "cast", skill: "solace", hp: 52 })
  expect(used.state.sp).toBe(bound.state.sp - 12)
  const saved = loadPlayer(JSON.parse(JSON.stringify(used.state)))
  expect(saved.hotbar[2]).toBe("skill:solace")
  expect(saved.worn.weapon?.by).toBe("エルナ")
  expect(saved.ready.solace).toBe(17000)
  expect(apply(saved, { type: "cast", skill: "solace" }, { now: 1001 })).toEqual({ ok: false, reason: "COOLDOWN" })
})

it("keeps the lighter prayer useful and leaves woodcutting optional", () => {
  const p = caster()
  const light = apply(p, { type: "cast", skill: "mend" }, { now: 1000 })
  const deep = apply(p, { type: "cast", skill: "solace" }, { now: 1000 })
  if (!light.ok || !deep.ok) throw Error("Prayer refused")
  expect(deep.state.hp).toBeGreaterThan(light.state.hp)
  expect(deep.state.sp).toBeLessThan(light.state.sp)
  expect(deep.state.ready.solace).toBeGreaterThan(light.state.ready.mend!)
  expect(artBlocked("kodama", p)).toBe("SKILL_TOO_LOW")
  expect(artBlocked("solace", p)).toBeNull()
})

it("requires the advanced staff, invested faith and enough SP", () => {
  const p = caster()
  expect(apply({ ...p, equipment: { ...p.equipment, weapon: "oak-staff" } }, { type: "cast", skill: "solace" })).toEqual({ ok: false, reason: "NO_WEAPON" })
  const lowFaith = { ...p, stats: { ...p.stats, fth: 15 }, equipment: { ...p.equipment, weapon: "world-branch-staff" as const } }
  expect(derive(lowFaith).stats.fth).toBe(17)
  expect(apply(lowFaith, { type: "cast", skill: "solace" })).toEqual({ ok: false, reason: "STAT_TOO_LOW" })
  expect(apply({ ...p, sp: SKILLS.solace.sp - 1 }, { type: "cast", skill: "solace" })).toEqual({ ok: false, reason: "SP_SHORT" })
  expect(apply(p, { type: "art", skill: "solace" })).toEqual({ ok: false, reason: "NOT_USABLE" })
})

it("uses the later staff's faith bonus for healing and caps recovery at maximum HP", () => {
  const base = caster()
  const p = { ...base, equipment: { ...base.equipment, weapon: "world-branch-staff" as const } }
  const healed = apply(p, { type: "cast", skill: "solace" }, { now: 1000 })
  expect(healed.ok && healed.events).toContainEqual({ type: "cast", skill: "solace", hp: 57 })
  const max = derive(p).maxHp
  const nearFull = apply({ ...p, hp: max - 1 }, { type: "cast", skill: "solace" }, { now: 1000 })
  expect(nearFull.ok && nearFull.state.hp).toBe(max)
  expect(apply({ ...p, hp: max }, { type: "cast", skill: "solace" }, { now: 1000 })).toEqual({ ok: false, reason: "HP_FULL" })
})
