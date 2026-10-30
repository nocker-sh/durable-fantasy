import { createTexturedMaterial } from "#/lib/graphics/create-textured-material"
import type * as THREE from "three"
import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { TexturedMaterialOptions } from "#/lib/graphics/material-types"

// A cache must not keep procedural map images alive after their scene is gone.
const variantsByPixels = new WeakMap<PixelBuffer, Map<string, THREE.MeshLambertMaterial>>()
export function getTexturedMaterial(pixels: PixelBuffer, options: TexturedMaterialOptions = {}): THREE.MeshLambertMaterial {
  const canShare = !options.alpha && !options.side
  const key = `${options.repeat ?? true}|${options.emissive ?? "none"}`
  const variants = variantsByPixels.get(pixels)
  const cached = variants?.get(key)
  if (canShare && cached) return cached
  const material = createTexturedMaterial({ pixels, options })
  if (!canShare) return material
  const entries = variants ?? new Map<string, THREE.MeshLambertMaterial>()
  variantsByPixels.set(pixels, entries)
  entries.set(key, material)
  material.addEventListener("dispose", () => {
    if (entries.get(key) === material) entries.delete(key)
  })
  return material
}
