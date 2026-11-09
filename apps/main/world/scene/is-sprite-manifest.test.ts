import { expect, it } from "vitest"
import { isSpriteManifest } from "#/world/scene/is-sprite-manifest"
it("accepts known manifest fields with additional authoring metadata", () => {
  expect(isSpriteManifest({ frame: [80, 96], residents: [{ name: "アントン", key: "look", anims: { idle: 8 }, notes: "extra" }], version: 2 })).toBe(true)
})
it.each([
  null,
  {},
  { frame: [80, 96], residents: null },
  { frame: [0, 96], residents: [] },
  { frame: [80, 96, 1], residents: [] },
  { frame: [80, 96], residents: [{ name: "アントン", key: "look", anims: [] }] },
  { frame: [80, 96], residents: [{ name: "アントン", key: "look", anims: { idle: -1 } }] },
  { frame: [80, 96], residents: [{ name: "アントン", key: "look", anims: { idle: 1.5 } }] },
  { frame: [80, 96], residents: [{ name: "アントン", anims: {} }] },
])("rejects malformed metadata instead of trusting a TypeScript cast: %j", (value) => {
  expect(isSpriteManifest(value)).toBe(false)
})

it.each([0, -1, 1.5, "6", null])("rejects an invalid renderer version while retaining legacy metadata parsing: %j", (rendererVersion) => {
  expect(isSpriteManifest({ rendererVersion, frame: [80, 96], residents: [] })).toBe(false)
})
