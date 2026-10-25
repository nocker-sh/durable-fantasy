import type { SpriteManifest } from "../baked"
import { MAPS } from "../../maps/index.ts"

const SPRITES = MAPS.phanthiet.assets.sprites

/** The baked residents' manifest, asked for once (every map uses the same one). */
let manifestP: Promise<SpriteManifest | null> | null = null

export function spriteManifest(): Promise<SpriteManifest | null> {
  manifestP ??= fetch(`${SPRITES}/sprites.json`)
    .then((r) => (r.ok ? (r.json() as Promise<SpriteManifest>) : null))
    .catch(() => {
      manifestP = null
      return null
    })
  return manifestP
}

export { SPRITES }
