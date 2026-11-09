import { existsSync, readdirSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { MONSTER_DRAFTS } from "#/world/core/monster-drafts"
import { MONSTER_KINDS } from "#/world/core/monsters"
import { ITEMS } from "#/world/core/items/catalog"
import { MAPS } from "#/world/maps"
import { getMonsterBodyRadius } from "#/world/core/get-monster-body-radius"

const entries = Object.entries(MONSTER_DRAFTS)

describe("the drafted creatures", () => {
  it("lists every file in the bestiary exactly once, under its file name, until it is let out", () => {
    const files = readdirSync(new URL("./bestiary", import.meta.url))
      .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
      .map((f) => f.slice(0, -3))
      .sort()
    // a creature let out moves from the drafts to MONSTER_KINDS under the same name
    expect([...Object.keys(MONSTER_DRAFTS), ...files.filter((file) => Object.hasOwn(MONSTER_KINDS, file))].sort()).toEqual(files)
    for (const draft of Object.values(MONSTER_DRAFTS)) expect(entries.filter((e) => e[1] === draft)).toHaveLength(1)
  })

  it("are not yet let out, and each has its own name", () => {
    for (const id of Object.keys(MONSTER_DRAFTS)) {
      expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/)
      expect(Object.hasOwn(MONSTER_KINDS, id), id).toBe(false)
    }
    const names = entries.map((e) => e[1].kind.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it("would live on a field outside town and leave only things the town already knows", () => {
    for (const entry of entries) {
      const id = entry[0]
      const draft = entry[1]
      expect(MAPS[draft.home]?.kind, id).toBe("field")
      expect(draft.life.length, id).toBeGreaterThan(10)
      expect(draft.origin.length, id).toBeGreaterThan(10)
      expect(draft.kind.drops.length, id).toBeGreaterThan(0)
      for (const drop of draft.kind.drops) {
        expect(Object.hasOwn(ITEMS, drop.item), `${id} ${drop.item}`).toBe(true)
        expect(ITEMS[drop.item].kind, `${id} ${drop.item}`).not.toBe("crystal")
        expect(drop.chance, id).toBeGreaterThan(0)
        expect(drop.chance, id).toBeLessThanOrEqual(1)
      }
    }
  })

  it("have whole, positive numbers to fight with", () => {
    for (const entry of entries) {
      const k = entry[1].kind
      for (const n of [k.hp, k.def, k.flee, k.atk, k.hit, k.exp, k.respawn]) {
        expect(Number.isInteger(n), entry[0]).toBe(true)
        expect(n, entry[0]).toBeGreaterThanOrEqual(0)
      }
      expect(k.hp, entry[0]).toBeGreaterThan(0)
      expect(k.respawn, entry[0]).toBeGreaterThanOrEqual(60)
    }
  })

  it("are built from finite blocks and fit a creature's footprint", () => {
    for (const entry of entries) {
      const id = entry[0]
      const model = entry[1].kind.model
      const radius = getMonsterBodyRadius({ kind: entry[1].kind })
      if (radius instanceof Error) throw radius
      expect(radius, id).toBeLessThan(2)
      expect(model.blocks.length, id).toBeGreaterThanOrEqual(4)
      for (const block of model.blocks) {
        const numbers = "to" in block ? [block.width, block.height, block.grow ?? 0] : [...block.size, ...block.at, ...(block.turn ?? [])]
        for (const n of numbers) expect(Number.isFinite(n), id).toBe(true)
        if ("to" in block) expect(Math.min(block.width, block.height), id).toBeGreaterThan(0)
        else for (const n of block.size) expect(n, id).toBeGreaterThan(0)
      }
    }
  })

  it("are moved by a rig whose model, walk and idle files are here", () => {
    for (const entry of entries) {
      const kind = entry[1].kind
      for (const file of ["model", "walk", "idle"]) expect(existsSync(new URL(`../../../../public/models/monsters/${kind.model.id}/${file}.glb`, import.meta.url)), `${entry[0]} ${file}`).toBe(true)
      expect(kind.model.length, entry[0]).toBeGreaterThan(0)
    }
  })

  it("differ from one another in shape, not only in colour", () => {
    const shapes = entries.map((e) => JSON.stringify(e[1].kind.model.blocks))
    expect(new Set(shapes).size).toBe(shapes.length)
  })
})
