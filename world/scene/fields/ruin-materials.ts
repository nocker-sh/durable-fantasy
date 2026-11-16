import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { leafTex } from "#/world/scene/textures/leaves"
import { plainTex } from "#/world/scene/textures/plain-tex"
import { rustTex } from "#/world/scene/textures/rust-tex"

/**
 * What the things left outside town are made of after two hundred years (world.md「場所」): rusted
 * iron, bronze gone green, bleached bone, weathered grey timber, and the moss that grows over all
 * of it.
 */
export const ruinMats = {
  rust: mat(rustTex({ light: 0.55, seed: 21 })),
  rustDark: mat(rustTex({ light: 0.34, seed: 22 })),
  bronze: mat(plainTex({ ramp: "verdigris", light: 0.5, noise: 0.5, seed: 23 })),
  bone: mat(plainTex({ ramp: "bone", light: 0.68, noise: 0.3, seed: 24 })),
  greyWood: mat(plainTex({ ramp: "cGray", light: 0.6, noise: 0.35, seed: 25 })),
  moss: mat(leafTex("moss", 26)),
  ivy: mat(leafTex("leaf2", 27)),
}
