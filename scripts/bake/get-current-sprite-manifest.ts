import { SPRITE_RENDER_VERSION } from "#/world/scene/sprite-render-version"
import { FW, FH } from "#/world/scene/figure/render"
import { FRAMES } from "#/world/scene/figure/animation"
import { RESIDENTS, RESIDENT_ANIMS, RESIDENT_LOOKS } from "#/world/town/residents"
import { lookKey } from "#/world/scene/sprite-key"
import type { SpriteManifest } from "#/world/scene/sprite-manifest-types"

export function getCurrentSpriteManifest(): SpriteManifest {
  return {
    rendererVersion: SPRITE_RENDER_VERSION,
    frame: [FW, FH],
    residents: RESIDENTS.map((resident, index) => ({
      name: resident.name,
      key: lookKey(RESIDENT_LOOKS[index], resident.item),
      anims: Object.fromEntries(RESIDENT_ANIMS.map((animation) => [animation, FRAMES[animation]])),
    })),
  }
}
