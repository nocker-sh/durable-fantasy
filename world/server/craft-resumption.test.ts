import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { RECIPES } from "#/world/core/recipes/catalog"
import { STATION_RULES, STAMINA_PER_CRAFT } from "#/world/core/crafting-rules"
import { countItem } from "#/world/core/count-item"
import { lifeThresholds } from "#/world/core/life-thresholds"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { player } from "#/world/test/player"
import { bagWith } from "#/world/test/bag-with"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

for (const roll of [0, 0.5])
  it.each(RECIPES)(`$id: paid inputs and the ${roll === 0 ? "spoiled" : "crafted"} result resume once after a failed save`, async (recipe) => {
    vi.useFakeTimers()
    vi.setSystemTime(1000)
    const station = STATION_RULES.find((entry) => entry.kind === recipe.station)!
    expect(station).toBeDefined()
    const base = player()
    // Skill, capacity and two batches of materials are local starting conditions, not a gathering route.
    const initial = player({
      profileComplete: true,
      gold: station.fee * 3,
      stamina: 100,
      stats: { ...base.stats, str: 40 },
      life: { ...base.life, [recipe.skill]: lifeThresholds[recipe.min] },
      bag: bagWith(...recipe.inputs.map((input): Parameters<typeof bagWith>[number] => [input.item, input.count * 2])),
    })
    const store = durableStorage({ ...initialPlayerRecord(), player: initial, location: { world: 1, map: "phanthiet", route: [[38, 80]], since: 1000, connection: "connection" } }, 8)
    const actors = { current: new Player.class(store.state, {}) }
    const request = { connection: "connection", seq: 1, recipe: recipe.id, station: station.id, roll }
    const before = structuredClone(store.saved.get("__void_durable_state"))
    store.failNextSave()
    await expect(actors.current.craft(request)).rejects.toThrow("Storage unavailable")
    expect(store.saved.get("__void_durable_state")).toEqual(before)
    actors.current = new Player.class(store.state, {})
    const completed = await actors.current.craft(request)
    if (!completed.ok) throw new Error(`${recipe.id}: ${completed.reason}`)
    expect(completed.events[0].type).toBe(roll === 0 ? "spoiled" : "crafted")
    expect(completed.state.gold).toBe(initial.gold - station.fee)
    expect(completed.state.stamina).toBe(initial.stamina - STAMINA_PER_CRAFT)
    for (const input of recipe.inputs)
      expect(countItem(completed.state.bag, input.item)).toBe(countItem(initial.bag, input.item) - input.count + (roll !== 0 && input.item === recipe.output.item ? recipe.output.count : 0))
    expect(countItem(completed.state.bag, recipe.output.item)).toBe(
      countItem(initial.bag, recipe.output.item) -
        recipe.inputs.filter((input) => input.item === recipe.output.item).reduce((sum, input) => sum + input.count, 0) +
        (roll === 0 ? 0 : recipe.output.count),
    )
    const saved = structuredClone(store.saved.get("__void_durable_state"))
    actors.current = new Player.class(store.state, {})
    expect(await actors.current.craft({ ...request, roll: roll === 0 ? 0.5 : 0 })).toEqual({ ok: true, state: completed.state, events: [] })
    for (const patch of [{ seq: 0 }, { recipe: "different" }, { station: "different" }, { connection: "other" }])
      expect(await actors.current.craft({ ...request, ...patch })).toEqual({ ok: false, reason: "NOT_READY" })
    expect(store.saved.get("__void_durable_state")).toEqual(saved)
    const next = await actors.current.craft({ ...request, seq: 2 })
    if (!next.ok) throw new Error(`${recipe.id}: ${next.reason}`)
    expect(next.events[0].type).toBe(roll === 0 ? "spoiled" : "crafted")
    expect(next.state.gold).toBe(initial.gold - station.fee * 2)
    const twice = structuredClone(store.saved.get("__void_durable_state"))
    expect(await actors.current.craft(request)).toEqual({ ok: false, reason: "NOT_READY" })
    expect(store.saved.get("__void_durable_state")).toEqual(twice)
  })

it("a refused request stays refused after materials arrive, while a new request may craft", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const initial = player({ gold: 20 })
  const store = durableStorage({ ...initialPlayerRecord(), player: initial, location: { world: 1, map: "phanthiet", route: [[38, 80]], since: 1000, connection: "connection" } }, 8)
  const actors = { current: new Player.class(store.state, {}) }
  const request = { connection: "connection", seq: 1, recipe: "cabbage-soup", station: "workshop-hearth", roll: 0.5 }
  expect(await actors.current.craft(request)).toEqual({ ok: false, reason: "MISSING_INPUTS" })
  // Dev-only grants supply a later local condition; they do not stand in for the craft itself.
  for (const item of ["cabbage", "onion", "firewood"] as const) await actors.current.give(item, 1)
  const supplied = structuredClone(store.saved.get("__void_durable_state"))
  actors.current = new Player.class(store.state, {})
  expect(await actors.current.craft(request)).toEqual({ ok: false, reason: "MISSING_INPUTS" })
  expect(store.saved.get("__void_durable_state")).toEqual(supplied)
  const completed = await actors.current.craft({ ...request, seq: 2 })
  if (!completed.ok) throw new Error(completed.reason)
  expect(completed.events[0].type).toBe("crafted")
  const sat = await actors.current.run({ type: "sit" })
  if (!sat.ok) throw new Error(sat.reason)
  const changed = structuredClone(store.saved.get("__void_durable_state"))
  expect(await actors.current.craft({ ...request, seq: 2 })).toEqual({ ok: true, state: sat.state, events: [] })
  expect(store.saved.get("__void_durable_state")).toEqual(changed)
})

it.each([
  { connection: "" },
  { connection: "other" },
  { seq: -1 },
  { seq: 0.5 },
  { seq: Number.MAX_SAFE_INTEGER + 1 },
  { roll: -0.1 },
  { roll: 1 },
  { roll: Number.NaN },
  { roll: Number.POSITIVE_INFINITY },
])("invalid crafting identity or roll cannot alter a saved record: %j", async (patch) => {
  const store = durableStorage({ ...initialPlayerRecord(), location: { world: 1, map: "phanthiet", route: [[38, 80]], since: 1000, connection: "connection" } }, 8)
  const actors = { current: new Player.class(store.state, {}) }
  const saved = structuredClone(store.saved.get("__void_durable_state"))
  expect(await actors.current.craft({ connection: "connection", seq: 1, recipe: "cabbage-soup", station: "workshop-hearth", roll: 0.5, ...patch })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(store.saved.get("__void_durable_state")).toEqual(saved)
})
