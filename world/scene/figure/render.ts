import { hexToRgb as hex } from "#/lib/graphics/hex-to-rgb"
import type { Primitive } from "#/lib/graphics/ray/primitive-types"

export const FW = 76,
  FH = 100,
  OX = 38,
  OY = 92

export const SPPU = 48

export const eyesDrawn = { count: 0 }

export const EYE_DARK = hex("#20182a")

/** Render an explicit native skeleton for procedural poses with the same palette, face and outline. */
export type PoseFrameOptions = { padding: number; blink: boolean; extraPrimitives?: readonly Omit<Primitive, "id">[] }
