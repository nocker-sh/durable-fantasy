import { expect, it } from "vitest"
import { restock } from "#/world/core/restock"
import { restoreMarket } from "#/world/server/restore-market"

it("advances current stock without consuming or losing retired saved items", () => {
  const saved = { shelf: {}, at: 0, stock: { general: { herb: 0, "retired-item": 7.25, constructor: 3, toString: 2 } } }
  const restored = restoreMarket(saved)
  const currentOnly = restock({ shelf: {}, at: 0, stock: { general: { herb: 0 } } }, 3_600_000, () => "")
  const advanced = restock(restored, 3_600_000, () => "")

  expect(advanced.stock).toEqual({ general: { herb: currentOnly.stock?.general?.herb, "retired-item": 7.25, constructor: 3, toString: 2 } })
  expect(advanced.at).toBe(3_600_000)
  expect(saved.stock.general.herb).toBe(0)
  expect(advanced.stock).not.toBe(saved.stock)
})
