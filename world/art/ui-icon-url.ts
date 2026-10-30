import { SPRITES } from "#/world/art/pixel-art"
import { silhouette } from "#/world/art/silhouette"
import type { SpriteName } from "#/world/art/pixel-art"

import { enlarge } from "#/world/art/icons/enlarge"
import { toUrl } from "#/world/art/icons/to-url"

const uiCache = new Map<string, string>()

/** A screen icon (menu buttons, HP, coins…), enlarged by a whole factor to at most `size` px. */
export function uiIconUrl(name: SpriteName, size = 32, empty = false): string {
  const key = `${name}|${size}|${empty}`
  const url = { value: uiCache.get(key) }
  if (!url.value) {
    const b = SPRITES[name]
    url.value = toUrl(enlarge(empty ? silhouette(b) : b, size))
    uiCache.set(key, url.value)
  }
  return url.value
}
