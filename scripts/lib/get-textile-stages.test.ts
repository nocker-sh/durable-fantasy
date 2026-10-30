import { expect, it } from "vitest"
import { getTextileStages } from "#/scripts/lib/get-textile-stages"

it("keeps spinning between wool and weaving even when every person is different", () => {
  const source = { textile: { wool_supplier: "shepherd", spinner: "spinner", weaver: "weaver", tailor: "tailor" }, owner: "sleeper" },
    before = JSON.stringify(source)
  expect(getTextileStages(source)).toEqual([
    { stage: "wool", supplier: "shepherd", recipient: "spinner" },
    { stage: "spin", supplier: "spinner", recipient: "weaver" },
    { stage: "weave", supplier: "weaver", recipient: "tailor" },
    { stage: "finish", supplier: "tailor", recipient: "sleeper" },
  ])
  expect(JSON.stringify(source)).toBe(before)
})
