import { expect, it } from "vitest"
import { scaling } from "#/world/core/scaling"
import { startingStats } from "#/world/core/starting-stats"

it("treats undefined optional grades as absent without poisoning the remaining scaling", () => {
  const stats = { ...startingStats(), dex: 15 }
  expect(scaling({ part: "weapon", atk: 20, scale: { str: undefined } }, stats)).toBe(0)
  expect(scaling({ part: "weapon", atk: 20, scale: { str: undefined, dex: "D" } }, stats)).toBe(4)
})
