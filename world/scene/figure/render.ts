import { hexToRgb as hex } from "#/lib/graphics/hex-to-rgb"
import type { Primitive } from "#/lib/graphics/ray/primitive-types"
import type { RGB } from "#/lib/graphics/pixel-types"

// below the feet (OY) the frame keeps room for toes, a broom head and a low sword tip, nearer the camera than the feet
export const FW = 76,
  FH = 112,
  OX = 38,
  OY = 92

export const SPPU = 48

export const eyesDrawn = { count: 0 }

export const EYE_DARK = hex("#20182a")

/** The T eye's lid: the eye's dark softened into the skin's shade, so it no longer reads as a brow darker than the eye. */
export const getEyeLid = (skin: readonly RGB[]): RGB => {
  const s = skin[1]
  return [Math.round(EYE_DARK[0] * 0.35 + s[0] * 0.65), Math.round(EYE_DARK[1] * 0.35 + s[1] * 0.65), Math.round(EYE_DARK[2] * 0.35 + s[2] * 0.65)]
}

/** Render an explicit native skeleton for procedural poses with the same palette, face and outline. */
export type PoseFrameOptions = { padding: number; blink: boolean; extraPrimitives?: readonly Omit<Primitive, "id">[] }
