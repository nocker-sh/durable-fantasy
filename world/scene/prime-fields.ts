import type { Layout } from "#/world/maps/layout-types"
import type { Fields } from "#/world/scene/world"
import { FIELD_CACHE } from "#/world/scene/world"

/** Fields worked out elsewhere (a worker, or kept from an earlier visit), for when the plan is next used. */
export function primeFields(l: Layout, f: Fields) {
  if (!FIELD_CACHE.has(l)) FIELD_CACHE.set(l, f)
}
