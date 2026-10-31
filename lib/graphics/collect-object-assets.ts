import type { Disposable } from "#/lib/engine/cleanup-types"
import type { Object3D } from "three"
import { collectMaterialAssets } from "#/lib/graphics/collect-material-assets"
import { isDisposable } from "#/lib/engine/is-disposable"

export function collectObjectAssets(object: Object3D, assets: Set<Disposable>): void {
  if ("geometry" in object && isDisposable(object.geometry)) assets.add(object.geometry)
  if ("material" in object) {
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    for (const material of materials) collectMaterialAssets(material, assets)
  }
  if ("shadow" in object && isDisposable(object.shadow)) assets.add(object.shadow)
}
