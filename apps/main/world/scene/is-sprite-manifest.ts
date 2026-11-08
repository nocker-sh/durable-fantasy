import { spriteManifestSchema } from "#/world/scene/sprite-manifest-schema"
import type { SpriteManifest } from "#/world/scene/sprite-manifest-types"

/** 構造の検査と、現在の描画版に適合するかの判定は分ける。 */
export function isSpriteManifest(value: unknown): value is SpriteManifest {
  return spriteManifestSchema.safeParse(value).success
}
