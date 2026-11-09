import { describe, expect, it } from "vitest"
import { HOUSEHOLDS } from "#/world/town/houses"
import { THINGS, THINGS_BY_HOUSEHOLD, thingsFor } from "#/world/scene/props/catalog"

describe("the small things under the eaves", () => {
  it("every household keeps things of its own trade and life, and each is a thing there is", () => {
    for (const hh of HOUSEHOLDS) {
      expect(THINGS_BY_HOUSEHOLD[hh.id], hh.id).toBeDefined()
      for (const id of thingsFor(hh.id, hh.living, false)) expect(THINGS[id], `${hh.id}: ${id}`).toBeDefined()
    }
  })

  it("every kind of thing is kept by someone", () => {
    const used = new Set(HOUSEHOLDS.flatMap((hh) => thingsFor(hh.id, hh.living, false)))
    for (const id of Object.keys(THINGS)) expect(used.has(id), id).toBe(true)
  })
})
