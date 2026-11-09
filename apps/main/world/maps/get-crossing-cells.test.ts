import { expect, it } from "vitest"
import { getCrossingCells } from "#/world/maps/get-crossing-cells"
import type { Side } from "#/world/maps/grid-types"

const cases: readonly { side: Side; at: readonly [number, number]; arrive: readonly [number, number] }[] = [
  { side: "n", at: [12, 3], arrive: [12, 8] },
  { side: "e", at: [29, 12], arrive: [24, 12] },
  { side: "s", at: [12, 29], arrive: [12, 24] },
  { side: "w", at: [3, 12], arrive: [8, 12] },
]
it.each(cases)("keeps the trigger and safe arrival inset on the $side edge", (input) => {
  expect(getCrossingCells(32, input.side, 12)).toEqual({ at: input.at, arrive: input.arrive })
})
