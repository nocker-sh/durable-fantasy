import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { plainTex } from "#/world/scene/textures/plain-tex"
import type { WoodId, Wood } from "#/world/scene/construction/furnishings"
import { grain } from "#/world/scene/construction/helpers/furnishings/grain"
import { woods } from "#/world/scene/construction/furnishings"

export function wood(id: WoodId): Wood {
  const hit = woods.get(id)
  if (hit) return hit
  const painted = id.startsWith("paint")
  const w: Wood = painted
    ? {
        id,
        body: mat(plainTex({ ramp: id, light: 0.55, noise: 0.12, seed: 3, size: 32 })),
        dark: mat(grain({ ramp: "pine", light: 0.35, seed: 4 })),
        top: mat(grain({ ramp: "pine", light: 0.6, seed: 5 })),
        trim: mat(plainTex({ ramp: "cHoney", light: 0.75, noise: 0.1, seed: 6, size: 16 })),
      }
    : { id, body: mat(grain({ ramp: id, light: 0.55, seed: 2, vertical: true })), dark: mat(grain({ ramp: id, light: 0.3, seed: 3 })), top: mat(grain({ ramp: id, light: 0.62, seed: 4 })), trim: null }
  woods.set(id, w)
  return w
}
