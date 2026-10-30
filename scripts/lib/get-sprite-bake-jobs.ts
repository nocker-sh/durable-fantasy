import type { SpriteBakePlan, SpriteBakeJob } from "#/scripts/lib/sprite-bake-types"

export function getSpriteBakeJobs(plan: SpriteBakePlan): readonly SpriteBakeJob[] {
  return plan.selected.flatMap((resident) => {
    const entry = plan.source.residents[resident]
    if (!entry) throw new Error("Sprite generation references an unknown resident index")
    return Object.keys(entry.anims).flatMap((anim) => Array.from({ length: 8 }, (_unused, view) => ({ resident, anim, view })))
  })
}
