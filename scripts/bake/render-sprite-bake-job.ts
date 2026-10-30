import { getSpriteBakeDrawInput } from "../lib/get-sprite-bake-draw-input"
import { join } from "node:path"
import { writeFileSync } from "node:fs"
import { getSpriteStripFilename } from "#/world/scene/get-sprite-strip-filename"
import { isCompleteSpriteStrip } from "../lib/is-complete-sprite-strip"
import { commitSpriteBakeStrip } from "../lib/commit-sprite-bake-strip"
import { drawSpriteBakePng } from "./draw-sprite-bake-png"
import { encodeSpriteWebp } from "./encode-sprite-webp"
import type { SpriteBakeJobContext as Props } from "./types"

export async function renderSpriteBakeJob(props: Props): Promise<void> {
  const input = getSpriteBakeDrawInput(props.plan, props.job)
  if (input instanceof Error) throw input
  const target = join(props.outputDirectory, getSpriteStripFilename(props.job.resident, props.job.anim, props.job.view))
  if (props.resume && isCompleteSpriteStrip(target)) return
  const png = await drawSpriteBakePng(props.page, input)
  writeFileSync(props.pngPath, Buffer.from(png))
  await commitSpriteBakeStrip({ pngPath: props.pngPath, target, token: props.token, encode: encodeSpriteWebp })
}
