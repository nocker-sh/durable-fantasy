import type { Disposable } from "#/lib/engine/cleanup-types"
import { isDisposable } from "#/lib/engine/is-disposable"

export function collectTextureAssets(value: unknown, assets: Set<Disposable>): void {
  if (Array.isArray(value)) {
    for (const entry of value) collectTextureAssets(entry, assets)
  } else if (isDisposable(value) && "isTexture" in value && value.isTexture) assets.add(value)
}
