import type { Disposable } from "#/lib/engine/cleanup-types"
import type { Object3D } from "three"
import { collectObjectAssets } from "#/lib/graphics/collect-object-assets"

/** Include shader-only textures and light shadow targets, not just material.map. */
export function disposeObjectTree(root: Object3D, release: (resource: Disposable) => void): void {
  const assets = new Set<Disposable>()
  root.traverse((object) => collectObjectAssets(object, assets))
  const errors: unknown[] = []
  for (const asset of assets)
    try {
      release(asset)
    } catch (error) {
      errors.push(error)
    }
  if (errors.length) throw new AggregateError(errors, "Scene asset cleanup failed")
}
