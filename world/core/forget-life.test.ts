import { expect, it } from "vitest"
import { apply } from "./apply"
import { commandSchema } from "./commands"
import { forgottenLifeExp } from "#/world/core/forgotten-life-exp"
import { gainLife } from "#/world/core/gain-life"
import { lifeExpAt } from "#/world/core/life-exp-at"
import { lifeLevel } from "#/world/core/life-level"
import { lifeTotal } from "#/world/core/life-total"
import { player } from "#/world/test/player"

it("frees a level at the total cap so another profession can grow without refunding experience", () => {
  const before = player({ life: { ...player().life, woodcutting: lifeExpAt(8), fishing: lifeExpAt(8), cooking: lifeExpAt(8) } })
  expect(lifeTotal(before.life)).toBe(24)
  expect(gainLife(before.life, "alchemy", 100).level).toBe(0)
  const result = apply(before, { type: "forget-life", skill: "fishing", exp: before.life.fishing })
  expect(result.ok).toBe(true)
  if (!result.ok) return
  expect(lifeLevel(result.state.life.fishing)).toBe(7)
  expect(lifeTotal(result.state.life)).toBe(23)
  expect(gainLife(result.state.life, "alchemy", 100).level).toBe(1)
  expect(before.life.fishing).toBe(lifeExpAt(8))
  expect(result.state.gold).toBe(before.gold)
  expect(result.state.bag).toEqual(before.bag)
})

it("drops partial progress too, rejects stale confirmations, and cannot forget below zero", () => {
  const before = player({ life: { ...player().life, cooking: lifeExpAt(2) + 15 } })
  const command = { type: "forget-life", skill: "cooking", exp: before.life.cooking } as const
  const result = apply(before, command)
  expect(result.ok).toBe(true)
  if (!result.ok) return
  expect(result.state.life.cooking).toBe(lifeExpAt(1))
  expect(apply(result.state, command)).toEqual({ ok: false, reason: "LIFE_CHANGED" })
  expect(forgottenLifeExp(15)).toBe(0)
  expect(apply(player(), { type: "forget-life", skill: "cooking", exp: 0 })).toEqual({ ok: false, reason: "NO_LIFE_EXP" })
})

it("requires removing equipment whose skill requirement would no longer be met", () => {
  const before = player({ life: { ...player().life, woodcutting: lifeExpAt(4) }, equipment: { ...player().equipment, weapon: "wood-axe" } })
  const command = { type: "forget-life", skill: "woodcutting", exp: before.life.woodcutting } as const
  expect(apply(before, command)).toEqual({ ok: false, reason: "LIFE_EQUIPPED" })
  expect(apply({ ...before, equipment: { ...before.equipment, weapon: null } }, command).ok).toBe(true)
})

it("validates skill and confirmation experience at the command boundary", () => {
  expect(commandSchema.safeParse({ type: "forget-life", skill: "cooking", exp: 40 }).success).toBe(true)
  for (const skill of ["unknown", "__proto__"]) expect(commandSchema.safeParse({ type: "forget-life", skill, exp: 40 }).success).toBe(false)
  for (const exp of [-1, 1.5, Infinity]) expect(commandSchema.safeParse({ type: "forget-life", skill: "cooking", exp }).success).toBe(false)
})
