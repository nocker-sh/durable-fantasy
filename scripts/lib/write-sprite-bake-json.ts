import type { SpriteManifest } from "#/world/scene/sprite-manifest-types"
import type { SpriteBakePlan } from "./sprite-bake-types"
import { renameSync, writeFileSync } from "node:fs"

/** 完成した JSON のみを読める名前へ移し、中断した書込みを再開の根拠にしない。 */
export function writeSpriteBakeJson(path: string, value: SpriteBakePlan | SpriteManifest): void {
  const temporary = `${path}.pending`
  writeFileSync(temporary, JSON.stringify(value))
  renameSync(temporary, path)
}
