import { spriteBakePlanSchema } from "./sprite-bake-plan-schema"
import { areSpriteManifestsEqual } from "./are-sprite-manifests-equal"
import type { SpriteBakePlan } from "./sprite-bake-types"

export function getSpriteBakeResumeError(expected: SpriteBakePlan, stored: unknown): Error | null {
  const parsed = spriteBakePlanSchema.safeParse(stored)
  if (!parsed.success) return new Error("Sprite generation has no valid pending plan")
  const pending = parsed.data
  if (
    pending.scope !== expected.scope ||
    pending.selected.length !== expected.selected.length ||
    pending.selected.some((resident, index) => resident !== expected.selected[index]) ||
    !areSpriteManifestsEqual(pending.source, expected.source) ||
    !areSpriteManifestsEqual(pending.output, expected.output)
  )
    return new Error("Sprite generation changed; restart with the intended renderer, residents, looks, animations and selection")
  return null
}
