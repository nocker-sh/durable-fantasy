import { describe, expect, it } from "vitest"
import { RESIDENTS } from "#/world/town/residents"
import { SHOPS } from "#/world/core/shops"
import { ITEMS } from "#/world/core/items/catalog"
import { HOUSEHOLDS, HOUSES } from "#/world/town/houses"
import { bedsOf } from "#/world/town/beds-of"
import { enterable } from "#/world/town/enterable"
import { floorsOf } from "#/world/town/floors-of"
import { seatsOf } from "#/world/town/house-seats-of"

describe("households and houses hang together", () => {
  it("every resident belongs to exactly one household", () => {
    const members = HOUSEHOLDS.flatMap((h) => h.members)
    for (const r of RESIDENTS)
      expect(
        members.filter((m) => m === r.name),
        r.name,
      ).toHaveLength(1)
    for (const m of members)
      expect(
        RESIDENTS.some((r) => r.name === m),
        m,
      ).toBe(true)
  })

  it("every household has one home with a bed for each member", () => {
    for (const hh of HOUSEHOLDS) {
      const homes = HOUSES.filter((h) => h.household === hh.id && h.plan.rooms.some((r) => r.beds))
      expect(homes, hh.id).toHaveLength(1)
      const extra = homes[0].kind === "public" && homes[0].shop === "inn" ? 3 : 0 // the inn's guest beds
      expect(bedsOf(homes[0]), hh.id).toBe(hh.members.length + extra)
    }
  })

  it("every lived-in building has a hearth, and a home is only as tall as its rooms", () => {
    for (const h of HOUSES) {
      if (h.kind !== "farm") expect(h.plan.hearth, h.id).toBe(true)
      expect(floorsOf(h), h.id).toBeGreaterThanOrEqual(1)
      expect(floorsOf(h), h.id).toBeLessThanOrEqual(2)
    }
  })

  it("each shop stands in a building on its own map, kept by someone who lives there or close by", () => {
    for (const [id, shop] of Object.entries(SHOPS)) {
      const house = HOUSES.find((h) => h.shop === id)
      if (!house) continue // market stalls on the square
      expect(house.map, id).toBe(shop.map)
      // the smithy is open to the yard; every other shop is entered
      expect(enterable(house) || house.kind === "workshop", id).toBe(true)
    }
  })

  it("house ids are unique", () => {
    expect(new Set(HOUSES.map((h) => h.id)).size).toBe(HOUSES.length)
  })
})

describe("daily life hangs together (consistency.md)", () => {
  const home = (id: string) => HOUSES.find((h) => h.household === id && h.plan.rooms.some((r) => r.beds))!

  it("everyone at home has a chair at the table", () => {
    for (const hh of HOUSEHOLDS) expect(seatsOf(home(hh.id)), hh.id).toBeGreaterThanOrEqual(hh.members.length)
  })

  it("every shopkeeper lives over the shop or in the same district; a day-shift hand may come from the next", () => {
    for (const [id, shop] of Object.entries(SHOPS)) {
      shop.keepers.forEach((name, k) => {
        const hh = HOUSEHOLDS.find((h) => h.members.includes(name))!
        // street sellers walk over from wherever they live; shopkeepers live over or by the shop
        if (k === 0 && !(shop as { at?: unknown }).at) expect(home(hh.id).map, `${id} ${name}`).toBe(shop.map)
        else expect(home(hh.id).map.split("-")[0], `${id} ${name}`).toBe(shop.map.split("-")[0])
      })
    }
  })

  it("supplies named in a household's trade come from someone who lives here", () => {
    // a name in a trade line (ヨーゼフ, ギュンター, …) is a resident of the town
    const names = new Set(RESIDENTS.map((r) => r.name))
    for (const hh of HOUSEHOLDS) {
      for (const m of hh.trade.matchAll(/[ァ-ヶー]{3,}/g)) if (!["ゼリー", "スープ", "チーズ", "キャベツ"].includes(m[0])) expect(names.has(m[0]), `${hh.id}: ${m[0]}`).toBe(true)
    }
  })

  it("words from another setting stay out of what people say and what things are called", () => {
    // a town, not a village; a monk of the goddess, not a priest of a god; no big organisations (world.md)
    const banned = [/村/, /神父/, /(?<!女)神の/, /商会/, /自治会/, /修道会/]
    const texts = [
      ...RESIDENTS.map((r) => r.job),
      ...HOUSEHOLDS.flatMap((h) => [h.name, h.trade]),
      ...HOUSES.map((h) => h.name),
      ...Object.values(SHOPS).flatMap((s) => [s.name, s.greeting]),
      ...Object.values(ITEMS).map((i) => i.description),
    ]
    for (const t of texts) for (const b of banned) expect(b.test(t), t).toBe(false)
  })
})
