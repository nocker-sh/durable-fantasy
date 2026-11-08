import { expect, it } from "vitest"
import { addItem } from "#/world/core/add-item"
import { displayName } from "#/world/core/display-name"
import { emptyBag } from "#/world/core/empty-bag"
import { parsePlayer } from "#/world/core/parse-player"
import { RENAMED_RESIDENTS } from "#/world/core/renamed-residents"
import { RESIDENTS } from "#/world/town/residents"
import { player } from "#/world/test/player"

const old = "ギュンター"
const now = "アルノルト"

it("carries an older save's friendship, purchases and makers over to the smith's new name", () => {
  const sword = addItem({ bag: emptyBag(), item: "iron-sword", count: 1, mark: { q: 2, by: old } })!
  const saved = player({
    friends: { [old]: 30, イルムガルト: 5 },
    boughtOn: { [old]: "2026-11-08" },
    bag: sword,
    storage: addItem({ bag: emptyBag(100), item: "dagger", count: 1, mark: { q: 1, by: old } })!,
    worn: { weapon: { q: 1, by: old } },
  })
  const loaded = parsePlayer(JSON.parse(JSON.stringify(saved)))!
  expect(loaded.friends).toEqual({ [now]: 30, イルムガルト: 5 })
  expect(loaded.boughtOn).toEqual({ [now]: "2026-11-08" })
  expect(loaded.bag[0]).toMatchObject({ item: "iron-sword", by: now, q: 2 })
  expect(loaded.storage[0]).toMatchObject({ item: "dagger", by: now })
  expect(loaded.worn.weapon).toEqual({ q: 1, by: now })
})

it("shows a maker kept under a former name by the name they go by now", () => {
  expect(displayName("iron-sword", old)).toBe(displayName("iron-sword", now))
})

it("renames only to residents who exist, and never back to a name still in use", () => {
  const names = new Set(RESIDENTS.map((resident) => resident.name))
  for (const entry of Object.entries(RENAMED_RESIDENTS)) {
    expect(names.has(entry[1])).toBe(true)
    expect(names.has(entry[0])).toBe(false)
  }
})
