import { expect, it, vi } from "vitest"
import { Directory } from "#/durable-objects/directory"
import { CHANNELS } from "#/world/channels"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))

it("drops the arrival times an old directory kept for every channel ever entered, and keeps its counts", async () => {
  const f = durableStorage({ counts: { phanthiet: { 1: 3, 7: 1 } }, seen: { "phanthiet~1": 1000, "phanthiet~7": 2000, "south-meadow~400": 3000 } }, 0)
  const town = new Directory.class(f.state, {})
  expect(await town.channels("phanthiet")).toEqual({ 1: 3, 7: 1 })
  expect(f.saved.get("__void_durable_state")).toEqual({ __voidDurableState: true, version: 1, value: { counts: { phanthiet: { 1: 3, 7: 1 } } } })
})

it("keeps nothing of a channel once everyone has left it", async () => {
  const f = durableStorage({ counts: {} }, 1)
  const town = new Directory.class(f.state, {})
  expect(await town.arrive({ map: "south-meadow", channel: 400, following: false, present: 0 })).toBe(true)
  await town.depart("south-meadow", 400)
  expect(f.saved.get("__void_durable_state")).toEqual({ __voidDurableState: true, version: 1, value: { counts: { "south-meadow": {} } } })
})

it("neither counts nor gives out a channel that no room can open", async () => {
  const f = durableStorage({ counts: {} }, 1)
  const town = new Directory.class(f.state, {})
  expect(await town.arrive({ map: "phanthiet", channel: CHANNELS + 1, following: false })).toBe(false)
  expect(await town.arrive({ map: "phanthiet", channel: 0, following: false })).toBe(false)
  expect(await town.channels("phanthiet")).toEqual({})
  expect(await town.choose({ map: "phanthiet", want: CHANNELS + 1 })).toBe(1)
  expect(await town.arrive({ map: "phanthiet", channel: CHANNELS, following: false })).toBe(true)
})
