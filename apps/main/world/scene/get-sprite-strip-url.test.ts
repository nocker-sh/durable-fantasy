import { expect, it } from "vitest"
import { getSpriteStripUrl } from "#/world/scene/get-sprite-strip-url"

const identity = { directory: "/sprites", resident: 3, animation: "idle", view: 2, rendererVersion: 6, key: "look", frame: [80, 96] satisfies [number, number], frames: 25 }

it("gives every changed rendering input a different HTTP cache address", () => {
  const original = getSpriteStripUrl(identity)
  expect(getSpriteStripUrl({ ...identity })).toBe(original)
  for (const changed of [
    { ...identity, rendererVersion: 7 },
    { ...identity, key: "new look" },
    { ...identity, frame: [81, 96] satisfies [number, number] },
    { ...identity, frame: [80, 97] satisfies [number, number] },
    { ...identity, frames: 29 },
    { ...identity, resident: 4 },
    { ...identity, animation: "look" },
    { ...identity, view: 3 },
  ])
    expect(getSpriteStripUrl(changed)).not.toBe(original)
})

it("keeps look contents in one encoded query value without changing the static file path", () => {
  const key = '{"color":"#123456","name":"首巻き + &?#=💧"}|cup'
  const address = new URL(getSpriteStripUrl({ ...identity, key }), "https://example.invalid")
  expect(address.pathname).toBe("/sprites/3-idle-2.webp")
  expect(address.hash).toBe("")
  expect([...address.searchParams.keys()]).toEqual(["renderer", "look", "frame", "frames"])
  expect(address.searchParams.get("look")).toBe(key)
})
