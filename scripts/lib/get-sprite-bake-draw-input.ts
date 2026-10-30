import type { SpriteBakePlan, SpriteBakeJob, SpriteBakeDrawInput } from "#/scripts/lib/sprite-bake-types"

export function getSpriteBakeDrawInput(plan: SpriteBakePlan, job: SpriteBakeJob): SpriteBakeDrawInput | Error {
  const resident = plan.source.residents[job.resident]
  const frames = resident?.anims[job.anim]
  if (!resident || typeof frames !== "number" || !Number.isSafeInteger(frames) || frames <= 0 || !Number.isSafeInteger(job.view) || job.view < 0 || job.view >= 8)
    return new Error("Sprite draw job leaves its measured generation plan")
  return { ...job, rendererVersion: plan.source.rendererVersion, frame: plan.source.frame, frames, residentName: resident.name, lookKey: resident.key }
}
