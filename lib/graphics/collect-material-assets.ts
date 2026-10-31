import type { Disposable } from "#/lib/engine/cleanup-types"
import { collectTextureAssets } from "#/lib/graphics/collect-texture-assets"
import { isDisposable } from "#/lib/engine/is-disposable"

export function collectMaterialAssets(value: unknown, assets: Set<Disposable>): void {
  if (!isDisposable(value)) return
  for (const property of Object.values(value)) collectTextureAssets(property, assets)
  if ("uniforms" in value && value.uniforms !== null && typeof value.uniforms === "object") {
    for (const uniform of Object.values(value.uniforms)) {
      if (uniform !== null && typeof uniform === "object" && "value" in uniform) collectTextureAssets(uniform.value, assets)
    }
  }
  assets.add(value)
}
