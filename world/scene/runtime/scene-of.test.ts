import { expect, it } from "vitest"
import { sceneOf } from "#/world/scene/runtime/scene-of"
import { MAP_SCENES } from "#/world/scene/runtime/definitions"

it("keeps registered scenes canonical and rejects unknown or prototype names", () => {
  expect(sceneOf("phanthiet")).toBe(MAP_SCENES.phanthiet)
  for (const name of ["__proto__", "constructor", "unknown", "phanthiet-in-h3@999", "phanthiet-in-h3@-1"]) expect(sceneOf(name)).toBeUndefined()
})

it("previews a private home without registering it or applying the authored display scale", () => {
  const before = Object.keys(MAP_SCENES)
  const scene = sceneOf("phanthiet-in-h3@1")
  expect(scene?.interior?.house.id).toBe("h3")
  expect(scene?.interior?.floor).toBe(1)
  expect(scene?.figureMetres).toBeUndefined()
  expect(Object.keys(MAP_SCENES)).toEqual(before)
})
