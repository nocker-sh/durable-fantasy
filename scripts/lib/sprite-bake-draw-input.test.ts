import { expect, it } from "vitest"
import { getSpriteBakeDrawInput } from "#/scripts/lib/get-sprite-bake-draw-input"
import { createSpriteBakePlan } from "#/scripts/lib/create-sprite-bake-plan"
import { getCurrentSpriteManifest } from "#/scripts/bake/get-current-sprite-manifest"
import { renderSpriteBakePng } from "#/scripts/bake/render-sprite-bake-png"

it("binds each draw to the exact resident, look, frame shape and animation length", () => {
  const source = getCurrentSpriteManifest()
  const plan = createSpriteBakePlan({ source, previous: null, only: null })
  if (plan instanceof Error) throw plan
  const input = getSpriteBakeDrawInput(plan, { resident: 0, anim: "idle", view: 3 })
  if (input instanceof Error) throw input
  expect(input).toEqual({
    resident: 0,
    anim: "idle",
    view: 3,
    rendererVersion: source.rendererVersion,
    frame: source.frame,
    frames: source.residents[0].anims.idle,
    residentName: source.residents[0].name,
    lookKey: source.residents[0].key,
  })
  for (const job of [
    { resident: -1, anim: "idle", view: 0 },
    { resident: 0, anim: "unknown", view: 0 },
    { resident: 0, anim: "toString", view: 0 },
    { resident: 0, anim: "idle", view: 8 },
    { resident: 0, anim: "idle", view: 0.5 },
  ])
    expect(getSpriteBakeDrawInput(plan, job)).toBeInstanceOf(Error)
})

it("rejects a stale browser-side identity before creating a canvas or rendering pixels", async () => {
  const plan = createSpriteBakePlan({ source: getCurrentSpriteManifest(), previous: null, only: null })
  if (plan instanceof Error) throw plan
  const input = getSpriteBakeDrawInput(plan, { resident: 0, anim: "idle", view: 0 })
  if (input instanceof Error) throw input
  for (const changed of [
    { ...input, rendererVersion: input.rendererVersion + 1 },
    { ...input, frame: [input.frame[0] + 1, input.frame[1]] satisfies [number, number] },
    { ...input, frames: input.frames + 1 },
    { ...input, residentName: "別人" },
    { ...input, lookKey: "different look" },
    { ...input, anim: "unknown" },
    { ...input, resident: -1 },
  ])
    await expect(renderSpriteBakePng(changed)).rejects.toThrow("inputs changed before drawing")
})
