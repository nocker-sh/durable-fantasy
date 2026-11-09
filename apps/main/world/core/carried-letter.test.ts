import { expect, it } from "vitest"
import { countItem } from "#/world/core/count-item"
import { dropLapsedParcels } from "#/world/core/drop-lapsed-parcels"
import { addItem } from "#/world/core/add-item"
import { emptyBag } from "#/world/core/empty-bag"
import { ERRANDS } from "#/world/core/errands"
import { apply } from "#/world/core/apply"
import { player } from "#/world/test/player"

const letter = ERRANDS.find((errand) => errand.kind === "deliver" && errand.carry)!

it("gives at least one errand a letter to carry, so the sealed letter has somewhere to come from", () => {
  expect(letter.kind === "deliver" && letter.carry).toBe("sealed-letter")
})

it("keeps a letter while its errand is open and drops it once the errand has lapsed or been handed over", () => {
  const withLetter = addItem({ bag: emptyBag(), item: "sealed-letter", count: 1 })!
  expect(countItem(dropLapsedParcels(withLetter, [{ id: letter.id, day: "2026-11-09", done: false }]), "sealed-letter")).toBe(1)
  expect(countItem(dropLapsedParcels(withLetter, []), "sealed-letter")).toBe(0)
  expect(countItem(dropLapsedParcels(withLetter, [{ id: letter.id, day: "2026-11-09", done: true }]), "sealed-letter")).toBe(0)
})

it("returns a lapsed letter at the next thing the player does, even without another errand", () => {
  const day = Date.parse("2026-11-09T12:00:00Z")
  const carrying = player({
    bag: addItem({ bag: emptyBag(), item: "sealed-letter", count: 1 })!,
    errands: [{ id: letter.id, day: "2026-11-08", done: false }],
  })
  // a seat on the roadside the next day, nothing to do with errands
  const sat = apply(carrying, { type: "sit" }, { now: day })
  expect(sat.ok).toBe(true)
  if (sat.ok) expect(countItem(sat.state.bag, "sealed-letter")).toBe(0)
})
