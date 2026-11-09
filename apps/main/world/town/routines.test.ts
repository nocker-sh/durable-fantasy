import { SHIFTS } from "#/world/town/shifts"
import { strictEqual } from "node:assert"
import { describe, expect, it } from "vitest"
import { daylight } from "#/world/core/daylight"
import { within } from "#/world/core/within"
import { SHOPS } from "#/world/core/shops"
import { MAPS } from "#/world/maps"
import { cellOfSpot } from "#/world/maps/cell-of-spot"
import { npcCell } from "#/world/maps/npc-cell"
import { npcsAt } from "#/world/maps/npcs-at"
import { shopOpen } from "#/world/maps/shop-open"
import { RESIDENTS } from "#/world/town/residents"
import { ROUTINES } from "#/world/town/routines"
import { slotAt } from "#/world/town/slot-at"
import { spotAt } from "#/world/town/spot-at"
import { workSpot } from "#/world/town/work-spot"
import { HOUSEHOLDS, HOUSES } from "#/world/town/houses"
import { windowsLit } from "#/world/town/windows-lit"

const EVERY = Array.from({ length: 48 }, (_, k) => k * 30)

describe("everyone's day", () => {
  it("every resident has a day, and it puts them somewhere that exists", () => {
    for (const r of RESIDENTS) {
      expect(ROUTINES[r.name], r.name).toBeDefined()
      for (const s of ROUTINES[r.name]) {
        const spot = spotAt(r.name, s.from, workSpot(r))
        if (!spot) continue
        const cell = cellOfSpot(spot)
        expect(cell, `${r.name} ${s.doing}`).not.toBeNull()
        expect(cell![0] >= 0 && cell![1] >= 0 && cell![0] < MAPS[spot.map].size && cell![1] < MAPS[spot.map].size, `${r.name} ${s.doing} on the map`).toBe(true)
      }
    }
  })

  it("everyone is home six hours or more (to sleep), and out for some of the day", () => {
    for (const r of RESIDENTS) {
      const home = EVERY.filter((m) => slotAt(r.name, m)?.where === "home").length / 2
      expect(home, r.name).toBeGreaterThanOrEqual(6)
      expect(home, r.name).toBeLessThan(23)
    }
  })

  it("everyone sleeps six hours or more a day", () => {
    for (const r of RESIDENTS) {
      const asleep =
        EVERY.filter((m) => {
          const s = slotAt(r.name, m)
          return s?.where === "home" && s.doing.includes("眠")
        }).length / 2
      expect(asleep, r.name).toBeGreaterThanOrEqual(6)
    }
  })

  it("a house's windows are dark while all of its household sleep", () => {
    for (const h of HOUSES)
      for (const m of EVERY) {
        const members = HOUSEHOLDS.find((x) => x.id === h.household)?.members ?? []
        const allAsleep =
          members.length > 0 &&
          members.every((n) => {
            const s = slotAt(n, m)
            return s?.where === "home" && s.doing.includes("眠")
          })
        if (allAsleep && h.household !== "guards") expect(windowsLit(h, m), `${h.id} at ${m / 60}h`).toBe(false)
      }
  })

  it("work that needs the sun is done in daylight", () => {
    const sunlit = ["アンナ", "クララ", "エルザ", "カール", "マティアス", "ゾフィー", "フリッツ", "ミア", "ヴィルヘルム"]
    for (const name of sunlit)
      for (const m of EVERY) {
        const s = slotAt(name, m)
        if (s?.where === "work") expect(daylight(m) > 0 || m < 9 * 60 + 60, `${name} at ${m / 60}h`).toBe(true)
      }
  })

  it("something is open whenever you come", () => {
    for (const m of EVERY) {
      const open = Object.entries(SHOPS).filter((entry1) => {
        const s = entry1[1]
        return s.keepers.some((k) => npcCell(MAPS[workSpot(RESIDENTS.find((r) => r.name === k)!).map], k, m))
      })
      expect(open.length, `${Math.floor(m / 60)}:${m % 60 || "00"}`).toBeGreaterThan(0)
    }
  })

  it("the cheap porridge can be had at every hour, so nobody is ever stuck with no stamina", () => {
    for (const m of EVERY) {
      const where = Object.entries(SHOPS).filter((entry2) => {
        const s = entry2[1]
        return (s.stock as readonly string[]).includes("porridge") && s.keepers.some((k) => npcCell(MAPS[workSpot(RESIDENTS.find((r) => r.name === k)!).map], k, m))
      })
      expect(where.length, `${Math.floor(m / 60)}:${m % 60 || "00"}`).toBeGreaterThan(0)
    }
  })

  it("there is a seat at the tavern for everyone drinking there at once", () => {
    for (const m of EVERY) {
      const here = npcsAt(MAPS["phanthiet-in-tavern"], m).map((n) => `${n.cell}`)
      expect(new Set(here).size, `${m / 60}h`).toBe(here.length)
    }
  })

  it("the town works in three shifts, each a fifth of the town or more (town.md「三交代」)", () => {
    for (const entry3 of Object.entries(SHIFTS)) {
      const shift = entry3[0],
        names = entry3[1]
      expect(names.length, shift).toBeGreaterThanOrEqual(Math.ceil(RESIDENTS.length / 5))
    }
  })

  it("at every hour, three in ten or more are out or minding a shop, and some are always in the streets", () => {
    for (const m of EVERY) {
      const seen = Object.values(MAPS).flatMap((map) => npcsAt(map, m).map((n) => ({ map, name: n.name })))
      const out = seen.filter((x) => x.map.kind !== "indoor").length
      expect(seen.length, `${m / 60}h up`).toBeGreaterThanOrEqual(Math.ceil((RESIDENTS.length * 3) / 10))
      expect(out, `${m / 60}h in the streets`).toBeGreaterThanOrEqual(6)
    }
  })

  it("the people about change with the shifts: the night shift keeps the night, the morning shift the dawn", () => {
    const about = (names: readonly string[], m: number) => names.filter((n) => Object.values(MAPS).some((map) => npcsAt(map, m).some((x) => x.name === n))).length
    expect(about(SHIFTS["夜番"], 22 * 60)).toBeGreaterThan(about(SHIFTS["夜番"], 11 * 60))
    expect(about(SHIFTS["朝番"], 5 * 60)).toBeGreaterThan(about(SHIFTS["朝番"], 20 * 60))
    expect(about(SHIFTS["昼番"], 12 * 60)).toBeGreaterThan(about(SHIFTS["昼番"], 1 * 60))
  })

  it("the town is busier by night than by day, and someone is always about", () => {
    const all = (m: number) => Object.values(MAPS).reduce((n, map) => n + npcsAt(map, m).length, 0)
    expect(all(22 * 60)).toBeGreaterThan(all(13 * 60))
    for (const m of EVERY)
      expect(
        Object.values(MAPS).reduce((n, map) => n + npcsAt(map, m).length, 0),
        `${m / 60}h`,
      ).toBeGreaterThan(3)
  })
})

describe("street sellers", () => {
  const sellers = Object.entries(SHOPS).filter((entry4) => {
    const s = entry4[1]
    return (s as { at?: unknown }).at
  })
  it("there are street sellers at many hours, each at their pitch only at their hours", () => {
    expect(sellers.length).toBeGreaterThanOrEqual(9)
    const hoursOpen = new Set(
      EVERY.filter((m) =>
        sellers.some((entry5) => {
          const id = entry5[0]
          return shopOpen(id as keyof typeof SHOPS, m)
        }),
      ).map((m) => Math.floor(m / 60)),
    )
    expect(hoursOpen.size).toBeGreaterThanOrEqual(10)
    // the dawn market is gone by midday, the night market is not there at noon
    expect(shopOpen("dawn-market", 7 * 60)).toBe(true)
    expect(shopOpen("dawn-market", 12 * 60)).toBe(false)
    expect(shopOpen("potato", 12 * 60)).toBe(false)
    expect(shopOpen("potato", 18 * 60)).toBe(true)
  })

  it("two sellers never share a pitch at the same time", () => {
    for (const m of EVERY) {
      const pitches = sellers
        .filter((entry6) => {
          const id = entry6[0]
          return shopOpen(id as keyof typeof SHOPS, m)
        })
        .map((entry7) => {
          const s = entry7[1]
          return `${(s as { at: { map: string; place: string } }).at.map}/${(s as { at: { map: string; place: string } }).at.place}`
        })
      expect(new Set(pitches).size, `${m / 60}h`).toBe(pitches.length)
    }
  })

  it("what they sell comes from somewhere in town", () => {
    for (const entry8 of sellers) {
      const id = entry8[0],
        s = entry8[1]
      for (const item of s.stock) {
        const made = (s as { makers?: Record<string, string> }).makers?.[item]
        if (made)
          expect(
            RESIDENTS.some((r) => r.name === made),
            `${id}: ${made}`,
          ).toBe(true)
      }
    }
  })
})

it("laundry workers dry indoors before their next job without closing the evening stall", () => {
  for (const name of ["アンナ", "クララ", "エルザ"]) {
    const resident = RESIDENTS.find((r) => r.name === name)!
    const drying = ROUTINES[name].find((slot) => slot.doing.includes("室内の縄に干す"))!
    expect(drying, name).toBeDefined()
    expect(drying.where, name).toBe("home")
    expect(spotAt(name, drying.from, workSpot(resident)), name).toBeNull()
    expect(slotAt(name, drying.from - 1)?.doing, name).toContain("洗う")
  }
  expect(shopOpen("fried-dough", 16 * 60 + 30)).toBe(true)
})

it("keeps every resident's schedule identical at all minutes and slot boundaries", () => {
  for (const entry9 of Object.entries(ROUTINES)) {
    const name = entry9[0],
      slots = entry9[1]

    const sorted = [...slots].sort((a, b) => a.from - b.from)
    const times = [...Array.from({ length: 1440 }, (_, minute) => minute), ...slots.flatMap((slot) => [slot.from - 0.01, slot.from + 0.01])]
    for (const minute of times) {
      const expected = sorted.find((slot, i) => within(minute, slot.from, sorted[(i + 1) % sorted.length].from)) ?? sorted[0] ?? null
      strictEqual(slotAt(name, minute), expected, `${name}: ${minute}`)
    }
  }
  expect(slotAt("unknown", 0)).toBeNull()
})

it("keeps the carter's loom quiet while anyone in its shared bedroom sleeps", () => {
  for (const minute of Array.from({ length: 24 * 60 }, (_, minute) => minute)) {
    const hasSleepingFamilyMember = ["ルカス", "エミール"].some((name) => slotAt(name, minute)?.doing.includes("眠"))
    if (hasSleepingFamilyMember) expect(slotAt("ベルタ", minute)?.doing, `shared bedroom at minute ${minute}`).not.toBe("機を織る")
  }
  expect(slotAt("ベルタ", 16 * 60)?.doing).toBe("機を織る")
  expect(slotAt("ベルタ", 23 * 60)).toMatchObject({ where: "home", doing: "古着を繕う" })
})

it("brings Emil home with an awake parent for bedtime", () => {
  expect(slotAt("エミール", 22 * 60 + 29)?.where).not.toBe("home")
  for (const minute of Array.from({ length: 30 }, (_, index) => 22 * 60 + 30 + index)) {
    expect(slotAt("エミール", minute)).toMatchObject({ where: "home", doing: "眠る" })
    expect(slotAt("ベルタ", minute)).toMatchObject({ where: "home", doing: "子を寝かせる" })
  }
  expect(slotAt("ベルタ", 23 * 60)?.doing).toBe("古着を繕う")
})
