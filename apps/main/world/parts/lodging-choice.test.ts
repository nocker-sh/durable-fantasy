import { expect, it } from "vitest"
import { GameSession } from "#/world/client/game-session"
import { LODGING } from "#/world/core/lodging"
import { SHOPS } from "#/world/core/shops"
import { choicesFor } from "#/world/parts/choices-for"
import { keepingShop } from "#/world/parts/keeping-shop"

const at = (min: number) => ({ ...new GameSession().state.get(), clock: { ...new GameSession().state.get().clock, min } })

it("offers a stay from the inn's keeper at her counter, and not from the tavern", () => {
  for (const keeper of SHOPS.inn.keepers) {
    const min = Array.from({ length: 96 }, (_, index) => index * 15).find((minute) => keepingShop(keeper, minute))
    if (min === undefined) continue
    expect(choicesFor(at(min), keeper).map((choice) => choice.label)).toContain(`泊まる（${LODGING.inn}G）`)
  }
  for (const keeper of SHOPS.tavern.keepers) {
    const min = Array.from({ length: 96 }, (_, index) => index * 15).find((minute) => keepingShop(keeper, minute))
    if (min === undefined) continue
    expect(choicesFor(at(min), keeper).some((choice) => choice.action === "lodge")).toBe(false)
  }
})
