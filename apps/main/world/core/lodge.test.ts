import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { derive } from "#/world/core/derive"
import { LODGING } from "#/world/core/lodging"
import { MAX_STAMINA } from "#/world/core/player-rules"
import { player } from "#/world/test/player"

it("brings stamina, HP and SP back for the price of a stay at the inn", () => {
  const tired = player({ gold: 100, stamina: 3, hp: 1, sp: 0 })
  const rested = apply(tired, { type: "lodge", shop: "inn" })
  expect(rested.ok).toBe(true)
  if (!rested.ok) return
  const derived = derive(tired)
  expect(rested.state).toMatchObject({ gold: 100 - LODGING.inn!, stamina: MAX_STAMINA, hp: derived.maxHp, sp: derived.maxSp })
  expect(rested.events).toEqual([{ type: "lodged", shop: "inn", cost: LODGING.inn }])
})

it("lets no bed where there is none, takes no money for nothing, and wants the price", () => {
  expect(apply(player({ gold: 100, stamina: 3 }), { type: "lodge", shop: "tavern" })).toEqual({ ok: false, reason: "NOT_SOLD_HERE" })
  const fresh = player({ gold: 100 })
  expect(apply({ ...fresh, hp: derive(fresh).maxHp, sp: derive(fresh).maxSp, stamina: MAX_STAMINA }, { type: "lodge", shop: "inn" })).toEqual({ ok: false, reason: "NOTHING_TO_GAIN" })
  expect(apply(player({ gold: 1, stamina: 3 }), { type: "lodge", shop: "inn" })).toEqual({ ok: false, reason: "NO_GOLD" })
})
