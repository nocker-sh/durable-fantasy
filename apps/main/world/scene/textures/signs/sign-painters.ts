import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import { paintBreadSign } from "#/world/scene/textures/signs/paint-bread-sign"
import { paintAnvilSign } from "#/world/scene/textures/signs/paint-anvil-sign"
import { paintMugSign } from "#/world/scene/textures/signs/paint-mug-sign"
import { paintCrossSign } from "#/world/scene/textures/signs/paint-cross-sign"
import { paintPotionSign } from "#/world/scene/textures/signs/paint-potion-sign"
import { paintCrystalSign } from "#/world/scene/textures/signs/paint-crystal-sign"
import { paintNeedleSign } from "#/world/scene/textures/signs/paint-needle-sign"
import { paintShieldSign } from "#/world/scene/textures/signs/paint-shield-sign"
import { paintBowSign } from "#/world/scene/textures/signs/paint-bow-sign"
import { paintHideSign } from "#/world/scene/textures/signs/paint-hide-sign"
import { paintScaleSign } from "#/world/scene/textures/signs/paint-scale-sign"
import { paintBagSign } from "#/world/scene/textures/signs/paint-bag-sign"
import { paintKeySign } from "#/world/scene/textures/signs/paint-key-sign"

export const SIGN_PAINTERS: ReadonlyMap<string, (buffer: PixelBuffer) => void> = new Map([
  ["bread", paintBreadSign],
  ["anvil", paintAnvilSign],
  ["mug", paintMugSign],
  ["cross", paintCrossSign],
  ["potion", paintPotionSign],
  ["crystal", paintCrystalSign],
  ["needle", paintNeedleSign],
  ["shield", paintShieldSign],
  ["bow", paintBowSign],
  ["hide", paintHideSign],
  ["scale", paintScaleSign],
  ["bag", paintBagSign],
  ["key", paintKeySign],
])
