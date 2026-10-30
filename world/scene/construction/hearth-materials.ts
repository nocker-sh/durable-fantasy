import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"

/** Shared across room rebuilds, matching the original hearth material's lifetime. */
export const HEARTH_COAL = colorMat(0xff8a3a)
