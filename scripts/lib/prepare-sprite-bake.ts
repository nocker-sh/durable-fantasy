import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { getSpriteBakeResumeError } from "./get-sprite-bake-resume-error"
import { getSpriteBakeJobs } from "./get-sprite-bake-jobs"
import { writeSpriteBakeJson } from "./write-sprite-bake-json"
import { getSpriteStripFilename } from "#/world/scene/get-sprite-strip-filename"
import type { SpriteBakePlan } from "./sprite-bake-types"
type Props = Readonly<{ directory: string; plan: SpriteBakePlan; resume: boolean }>

export function prepareSpriteBake(props: Props): void {
  const pendingPath = join(props.directory, ".bake-plan.json")
  if (props.resume) {
    const pending: unknown = existsSync(pendingPath) ? JSON.parse(readFileSync(pendingPath, "utf8")) : null
    const invalid = getSpriteBakeResumeError(props.plan, pending)
    if (invalid) throw invalid
    return
  }
  const jobs = getSpriteBakeJobs(props.plan)
  if (props.plan.scope === "all") rmSync(props.directory, { recursive: true, force: true })
  else {
    rmSync(pendingPath, { force: true })
    for (const job of jobs) rmSync(join(props.directory, getSpriteStripFilename(job.resident, job.anim, job.view)), { force: true })
  }
  mkdirSync(props.directory, { recursive: true })
  writeSpriteBakeJson(pendingPath, props.plan)
}
