import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { isSpriteManifest } from "#/world/scene/is-sprite-manifest"
import { createSpriteBakePlan } from "#/scripts/lib/create-sprite-bake-plan"
import { getSpriteBakeJobs } from "#/scripts/lib/get-sprite-bake-jobs"
import { prepareSpriteBake } from "#/scripts/lib/prepare-sprite-bake"
import { completeSpriteBake } from "#/scripts/lib/complete-sprite-bake"
import { getCurrentSpriteManifest } from "#/scripts/bake/get-current-sprite-manifest"
import { renderSpriteBakePlan } from "#/scripts/bake/render-sprite-bake-plan"
import type { SpriteBakeRunInput as Props } from "#/scripts/bake/types"

export async function runSpriteBake(props: Props): Promise<void> {
  const previousPath = join(props.outputDirectory, "sprites.json")
  const previous: unknown = props.only !== null && existsSync(previousPath) ? JSON.parse(readFileSync(previousPath, "utf8")) : null
  const plan = createSpriteBakePlan({ source: getCurrentSpriteManifest(), previous: isSpriteManifest(previous) ? previous : null, only: props.only })
  if (plan instanceof Error) throw plan
  const preparation = { directory: props.outputDirectory, plan, resume: props.resume }
  if (props.resume) prepareSpriteBake(preparation)
  const jobs = getSpriteBakeJobs(plan)
  const started = Date.now()
  await renderSpriteBakePlan({
    ...props,
    plan,
    jobs,
    prepare: () => {
      if (!props.resume) prepareSpriteBake(preparation)
    },
  })
  completeSpriteBake({ directory: props.outputDirectory, plan })
  console.log(`completed ${jobs.length} strips in ${((Date.now() - started) / 1000).toFixed(1)}s`)
}
