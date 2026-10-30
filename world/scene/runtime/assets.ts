import { SPRITE_RENDER_VERSION } from "../sprite-render-version"
import { OptionalCacheAccess } from "../../../lib/engine/optional-cache-access"
import { isSpriteManifest } from "../is-sprite-manifest"
import type { SpriteManifest } from "../sprite-manifest-types"
import { MAPS } from "../../maps/index"

const SPRITES = MAPS.phanthiet.assets.sprites
const manifestAccess = new OptionalCacheAccess(5000)

/** Every map shares one bounded request; unavailable baked images leave procedural drawing usable. */
let manifestP: Promise<SpriteManifest | null> | null = null

export function spriteManifest(): Promise<SpriteManifest | null> {
  return (manifestP ??= loadManifest())
}

async function loadManifest(): Promise<SpriteManifest | null> {
  const controller = new AbortController()
  try {
    return await manifestAccess.run(async () => {
      const response = await fetch(`${SPRITES}/sprites.json`, { signal: controller.signal, cache: "no-cache" })
      if (!response.ok) return null
      const manifest: unknown = await response.json()
      return isSpriteManifest(manifest) && manifest.rendererVersion === SPRITE_RENDER_VERSION ? manifest : null
    }, null)
  } finally {
    controller.abort()
  }
}

export { SPRITES }
