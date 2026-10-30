import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { derive } from "#/world/core/derive"
import { emptyEquipment } from "#/world/core/empty-equipment"
import { loadPlayer } from "#/world/core/load-player"
import { player } from "#/world/test/player"

const caster = (faith: number) =>
  player({
    hp: 1,
    sp: 30,
    stats: { ...player().stats, fth: faith },
    equipment: { ...emptyEquipment(), weapon: "oak-staff", accessory1: "prayer-necklace" },
  })
it("uses the necklace's faith for healing while retaining SP cost and cooldown", () => {
  const p = loadPlayer(JSON.parse(JSON.stringify(caster(9))))
  expect(derive(p).stats.fth).toBe(11)
  expect(p.stats.fth).toBe(9)
  const result = apply(p, { type: "cast", skill: "mend" }, { now: 1000 })
  if (!result.ok) throw Error(result.reason)
  expect(result.state.hp - p.hp).toBe(19)
  expect(result.state.sp).toBe(24)
  expect(apply(result.state, { type: "cast", skill: "mend" }, { now: 1001 })).toEqual({ ok: false, reason: "COOLDOWN" })
  const bare = { ...p, equipment: { ...p.equipment, accessory1: null } }
  const ordinary = apply(bare, { type: "cast", skill: "mend" }, { now: 1000 })
  expect(ordinary.ok && ordinary.state.hp - bare.hp).toBe(16)
})
it("cannot substitute accessory faith for the prayer requirement", () => {
  const p = caster(7)
  expect(derive(p).stats.fth).toBe(9)
  expect(apply(p, { type: "cast", skill: "mend" })).toEqual({ ok: false, reason: "STAT_TOO_LOW" })
})
it("caps boosted healing at maximum HP", () => {
  const p = caster(9)
  const max = derive(p).maxHp
  const result = apply({ ...p, hp: max - 1 }, { type: "cast", skill: "mend" })
  expect(result.ok && result.state.hp).toBe(max)
  expect(result.ok && result.events).toContainEqual({ type: "cast", skill: "mend", hp: 1 })
})
