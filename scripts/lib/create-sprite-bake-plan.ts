import { spriteManifestSchema } from "#/world/scene/sprite-manifest-schema"
import { spriteBakePlanSchema } from "./sprite-bake-plan-schema"
import { getSpriteBakeSelection } from "./get-sprite-bake-selection"
import { getSpriteBakeOutput } from "./get-sprite-bake-output"
import type { SpriteManifest } from "#/world/scene/sprite-manifest-types"
import type { SpriteBakePlan } from "./sprite-bake-types"
type Props = Readonly<{ source: SpriteManifest; previous: SpriteManifest | null; only: readonly string[] | null }>

export function createSpriteBakePlan(props: Props): SpriteBakePlan | Error {
  const source = spriteManifestSchema.safeParse(props.source)
  if (!source.success || source.data.rendererVersion === undefined) return new Error("Sprite generation requires a measured source and renderer version")
  const selected = getSpriteBakeSelection({ source: source.data, only: props.only })
  if (selected instanceof Error) return selected
  if (!selected.length) return new Error("Sprite generation has no residents")
  const measured = { ...source.data, rendererVersion: source.data.rendererVersion }
  const output = getSpriteBakeOutput({ source: measured, previous: props.previous, selected, partial: props.only !== null })
  if (output instanceof Error) return output
  return spriteBakePlanSchema.parse({ format: 1, scope: props.only === null ? "all" : "selected", source: source.data, output, selected })
}
