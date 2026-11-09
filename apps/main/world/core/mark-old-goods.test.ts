import { expect, it } from "vitest"
import { parsePlayer } from "#/world/core/parse-player"
import { newPlayer } from "#/world/core/new-player"
import { emptyEquipment } from "#/world/core/empty-equipment"
import { usualMaker } from "#/world/core/usual-maker"
import { getOrderEscrowCommand } from "#/world/core/get-order-escrow-command"
import { addItem } from "#/world/core/add-item"
import { apply } from "#/world/core/apply"

const slots = (size: number, filled: readonly object[]) => Array.from({ length: size }, (_, index) => filled[index] ?? null)

/** A save from before these goods were made things: no quality or maker on them, and nothing recorded for what is worn. */
function olderSave(): Record<string, unknown> {
  const fresh = newPlayer("エルナ")
  const saved = JSON.parse(
    JSON.stringify({
      ...fresh,
      profileComplete: true,
      bag: slots(fresh.bag.length, [
        { item: "iron-sword", count: 1 },
        { item: "blue-potion", count: 3 },
        { item: "wood-axe", count: 1, dur: 7 },
        { item: "apple", count: 2 },
        // returned from an old exchange order, which kept the quality but no maker
        { item: "potion", count: 2, q: 2 },
        { item: "dagger", count: 1, by: "エルナ" },
        { item: "iron-sword", count: 1, q: 3, by: "エルナ" },
        { item: "wooden-stick", count: 1 },
        { item: "wooden-stick", count: 1, q: 2 },
      ]),
      storage: slots(fresh.storage.length, [{ item: "orange-potion", count: 2 }]),
      equipment: { ...emptyEquipment(), weapon: "wooden-stick", body: "leather-armor" },
    }),
  )
  delete saved.worn
  return saved
}

it("gives old unmarked made goods an ordinary mark by their usual maker when the save is read", () => {
  const loaded = parsePlayer(olderSave())
  if (!loaded) throw Error("unreadable")
  expect(loaded.bag.slice(0, 9)).toEqual([
    { item: "iron-sword", count: 1, q: 1, by: usualMaker("iron-sword") },
    { item: "blue-potion", count: 3, q: 1, by: usualMaker("blue-potion") },
    { item: "wood-axe", count: 1, dur: 7, q: 1, by: usualMaker("wood-axe") },
    { item: "apple", count: 2 },
    { item: "potion", count: 2, q: 2, by: usualMaker("potion") },
    { item: "dagger", count: 1, q: 1, by: "エルナ" },
    { item: "iron-sword", count: 1, q: 3, by: "エルナ" },
    // the branch a traveller picks up on the road is nobody's make; a stick with a quality was made
    { item: "wooden-stick", count: 1 },
    { item: "wooden-stick", count: 1, q: 2, by: usualMaker("wooden-stick") },
  ])
  expect(loaded.storage[0]).toEqual({ item: "orange-potion", count: 2, q: 1, by: usualMaker("orange-potion") })
  expect(loaded.worn).toEqual({ body: { q: 1, by: usualMaker("leather-armor") } })
  expect(parsePlayer(JSON.parse(JSON.stringify(loaded)))).toEqual(loaded)
})

it("lets the old goods go on the exchange and stack with new ones", () => {
  const loaded = parsePlayer(olderSave())
  if (!loaded) throw Error("unreadable")
  expect(getOrderEscrowCommand(loaded, { side: "sell", symbol: "iron-sword@1", price: 200, qty: 1, slot: 0 })).toMatchObject({
    command: { type: "escrow-sell", slot: 0, qty: 1 },
    by: usualMaker("iron-sword"),
  })
  expect(addItem({ bag: loaded.bag, item: "blue-potion", count: 1 })?.[1]).toEqual({ item: "blue-potion", count: 4, q: 1, by: usualMaker("blue-potion") })
  const removed = apply(loaded, { type: "unequip", slot: "body" })
  if (!removed.ok) throw Error(removed.reason)
  expect(removed.state.bag).toContainEqual({ item: "leather-armor", count: 1, q: 1, by: usualMaker("leather-armor") })
})

it("marks the goods of the first saved shape", () => {
  const loaded = parsePlayer({ version: 1, gold: 9, hp: 30, bag: slots(newPlayer().bag.length, [{ item: "blue-potion", count: 1 }]), weapon: "dagger", hotbar: newPlayer().hotbar })
  if (!loaded) throw Error("unreadable")
  expect(loaded.bag[0]).toEqual({ item: "blue-potion", count: 1, q: 1, by: usualMaker("blue-potion") })
  expect(loaded.worn).toEqual({ weapon: { q: 1, by: usualMaker("dagger") } })
})

it("keeps a new traveller's branch unmarked, worn or put away", () => {
  const fresh = newPlayer()
  expect(parsePlayer(JSON.parse(JSON.stringify(fresh)))).toEqual(fresh)
  const removed = apply(fresh, { type: "unequip", slot: "weapon" })
  if (!removed.ok) throw Error(removed.reason)
  expect(parsePlayer(JSON.parse(JSON.stringify(removed.state)))?.bag).toContainEqual({ item: "wooden-stick", count: 1 })
})
