import { expect, it } from "vitest"
import { revealed } from "#/world/revealed"
import { TEXT_SPEED, type Dialogue } from "#/world/state"

const page = (shownAt: number): Dialogue => ({ resident: 0, name: "アルノルト", job: "鍛冶屋", pages: ["あ".repeat(40)], page: 0, choices: [], shownAt })

it("shows nothing of a new page for a clock read just before it was shown", () => {
  const text = "あ".repeat(40)
  expect(revealed(page(10_000), 9_700)).toBe(0)
  expect(text.slice(0, revealed(page(10_000), 9_700))).toBe("")
})

it("types out at the text speed and stops at the end of the page", () => {
  expect(revealed(page(1000), 1000 + 1000 / TEXT_SPEED)).toBe(1)
  expect(revealed(page(1000), 1_000_000)).toBe(40)
  expect(revealed(page(0), 5)).toBe(40)
})
