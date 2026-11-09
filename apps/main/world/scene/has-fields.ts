import type { Layout } from "#/world/maps/layout-types"
import { FIELD_CACHE } from "#/world/scene/world"

export const hasFields = (l: Layout) => FIELD_CACHE.has(l)
