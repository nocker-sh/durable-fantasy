import { expect, it } from "vitest"
import { addItem } from "#/world/core/add-item"
import { displayName } from "#/world/core/display-name"
import { emptyBag } from "#/world/core/empty-bag"
import { emptyEquipment } from "#/world/core/empty-equipment"
import { parsePlayer } from "#/world/core/parse-player"
import { RENAMED_RESIDENTS } from "#/world/core/renamed-residents"
import { reservedName } from "#/world/core/reserved-name"
import { RESIDENTS } from "#/world/town/residents"
import { player } from "#/world/test/player"

const old = "ギュンター"
const now = "アルノルト"

it("carries an older save's friendship, purchases and makers over to the smith's new name", () => {
  const sword = addItem({ bag: emptyBag(), item: "iron-sword", count: 1, mark: { q: 2, by: old } })!
  const saved = player({
    friends: { [old]: 30, イルムガルト: 5 },
    boughtOn: { [old]: "2026-11-08" },
    // the reinforced sword is commission work a player finishes (commissions.ts), so it stays under the old name
    bag: addItem({ bag: sword, item: "reinforced-sword", count: 1, mark: { q: 1, by: old } })!,
    storage: addItem({ bag: emptyBag(100), item: "dagger", count: 1, mark: { q: 1, by: old } })!,
    equipment: { ...emptyEquipment(), weapon: "iron-sword" },
    worn: { weapon: { q: 1, by: old } },
  })
  const loaded = parsePlayer(JSON.parse(JSON.stringify(saved)))!
  expect(loaded.friends).toEqual({ [now]: 30, イルムガルト: 5 })
  expect(loaded.boughtOn).toEqual({ [now]: "2026-11-08" })
  expect(loaded.bag[0]).toMatchObject({ item: "iron-sword", by: now, q: 2 })
  expect(loaded.bag[1]).toMatchObject({ item: "reinforced-sword", by: old })
  expect(loaded.storage[0]).toMatchObject({ item: "dagger", by: now })
  expect(loaded.worn.weapon).toEqual({ q: 1, by: now })
})

it("shows a maker kept under a former name by the name they go by now", () => {
  expect(displayName("iron-sword", old)).toBe(displayName("iron-sword", now))
})

it("leaves a player who took the former name the credit for what the smith does not make", () => {
  const saved = player({
    name: old,
    profileComplete: true,
    bag: addItem({ bag: emptyBag(), item: "stew", count: 1, mark: { q: 2, by: old } })!,
    storage: addItem({ bag: emptyBag(100), item: "potion", count: 1, mark: { q: 3, by: old } })!,
    equipment: { ...emptyEquipment(), weapon: "wooden-stick" },
    worn: { weapon: { q: 0, by: old } },
  })
  const loaded = parsePlayer(JSON.parse(JSON.stringify(saved)))!
  expect(parsePlayer(JSON.parse(JSON.stringify(loaded)))).toEqual(loaded)
  expect(loaded.name).toBe(old)
  expect(loaded.bag[0]).toMatchObject({ item: "stew", by: old, q: 2 })
  expect(loaded.storage[0]).toMatchObject({ item: "potion", by: old, q: 3 })
  expect(loaded.worn.weapon).toEqual({ q: 0, by: old })
  expect(displayName("stew", old)).toBe(`${old}のシチュー`)
})

it("renames only to residents who exist, never back to a name still in use, and keeps the former name from players", () => {
  const names = new Set(RESIDENTS.map((resident) => resident.name))
  for (const entry of Object.entries(RENAMED_RESIDENTS)) {
    expect(names.has(entry[1])).toBe(true)
    expect(names.has(entry[0])).toBe(false)
    expect(reservedName(entry[0])).toBe(true)
  }
})
