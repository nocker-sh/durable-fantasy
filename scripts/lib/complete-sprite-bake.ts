import { isCompleteSpriteStrip } from "#/scripts/lib/is-complete-sprite-strip"
import { existsSync, readFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { getSpriteBakeJobs } from "#/scripts/lib/get-sprite-bake-jobs"
import { getSpriteBakeResumeError } from "#/scripts/lib/get-sprite-bake-resume-error"
import { writeSpriteBakeJson } from "#/scripts/lib/write-sprite-bake-json"
import { getSpriteStripFilename } from "#/world/scene/get-sprite-strip-filename"
import type { SpriteBakePlan } from "#/scripts/lib/sprite-bake-types"
type Props = Readonly<{ directory: string; plan: SpriteBakePlan }>

/** 全対象の確定ファイルがそろってから完成資料を置き換える。 */
export function completeSpriteBake(props: Props): void {
  const pendingPath = join(props.directory, ".bake-plan.json")
  const pending: unknown = existsSync(pendingPath) ? JSON.parse(readFileSync(pendingPath, "utf8")) : null
  const invalid = getSpriteBakeResumeError(props.plan, pending)
  if (invalid) throw invalid
  if (getSpriteBakeJobs(props.plan).some((job) => !isCompleteSpriteStrip(join(props.directory, getSpriteStripFilename(job.resident, job.anim, job.view)))))
    throw new Error("Sprite generation has unfinished strips")
  writeSpriteBakeJson(join(props.directory, "sprites.json"), props.plan.output)
  rmSync(pendingPath)
}
