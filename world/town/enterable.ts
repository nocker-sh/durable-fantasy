import type { HouseDef } from "#/world/town/house-types"

/** Buildings you can walk into: shops and public buildings (homes are private). */
export const enterable = (h: HouseDef) => h.kind === "shop" || h.kind === "public"
