import { expect, it, vi } from "vitest"
import { Directory } from "#/durable-objects/directory"
import { CHANNEL_CAP } from "#/world/channels"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))

it("keeps the count of a room that says it is full, so the next arrival is sent elsewhere", async () => {
  const town = new Directory.class(durableStorage({ counts: { phanthiet: { 1: CHANNEL_CAP - 3 } }, seen: {} }, 0).state, {})
  // the directory missed some arrivals: it still thinks channel 1 has room
  expect(await town.choose({ map: "phanthiet" })).toBe(1)
  expect(await town.arrive({ map: "phanthiet", channel: 1, following: false, present: CHANNEL_CAP })).toBe(false)
  expect(await town.channels("phanthiet")).toEqual({ 1: CHANNEL_CAP })
  expect(await town.choose({ map: "phanthiet" })).toBe(2)
})
