import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import { traitOf } from "#/world/core/trait-of"
import { RAMPS } from "#/world/scene/pix"

import { enlarge } from "#/world/art/icons/enlarge"
import { crop } from "#/world/art/icons/crop"
import { draw } from "#/world/art/icons/draw"
import { toUrl } from "#/world/art/icons/to-url"

const cache = new Map<string, string>()

/** An item's icon; a maker may bottle or serve it their own way (core/trait-of.ts). */
export function iconUrl(id: ItemId, by?: string): string {
  const icon = traitOf(id, by)?.icon ?? ITEMS[id].icon
  const metal = ITEMS[id].metal ?? "iron"
  const key = `${icon}|${metal}`
  const url = { value: cache.get(key) }
  if (!url.value) {
    url.value = toUrl(enlarge(crop(draw(icon, RAMPS[metal]), 1), 32))
    cache.set(key, url.value)
  }
  return url.value
}
