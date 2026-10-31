import { layout, walkSurfaces } from "#/world/scene/world"
import { inRect } from "#/lib/engine/in-rect"
import { groundH } from "#/world/scene/ground-h"
import { bridgeDeckH } from "#/world/scene/bridge-deck-h"

/** Height a character stands at. */
export function walkH(x: number, z: number): number {
  if (inRect({ x: x, z: z, r: layout.value.bridge })) return Math.max(groundH(x, z), bridgeDeckH(x))
  const height = { value: groundH(x, z) }
  for (const surface of walkSurfaces) if (x >= surface.rect[0] && x < surface.rect[2] && z >= surface.rect[1] && z < surface.rect[3]) height.value = Math.max(height.value, surface.height)
  return height.value
}
