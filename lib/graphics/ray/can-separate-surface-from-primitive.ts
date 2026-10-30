import { isFiniteOrderedBounds } from "#/lib/engine/is-finite-ordered-bounds"
import { primitiveBounds } from "#/lib/graphics/ray/primitive-bounds"
import { canSeparateSurfaceEnvelopes } from "#/lib/graphics/ray/can-separate-surface-envelopes"
import { canSeparateSurfaceFields } from "#/lib/graphics/ray/can-separate-surface-fields"
import { areExpandedBoundsSeparated } from "#/lib/engine/are-expanded-bounds-separated"
import type { SurfaceSeparationInput as Props } from "#/lib/graphics/ray/surface-separation-types"

/** 必要な余地を含めて外形が離れる組を先に確定し、近い組だけを詳細に証明する。 */
export function canSeparateSurfaceFromPrimitive(props: Props): boolean {
  if (!Number.isFinite(props.margin) || props.margin < 0) return false
  const bounds = primitiveBounds(props.primitive)
  if (areExpandedBoundsSeparated({ moving: props.surface.bounds, fixed: bounds, margin: props.margin })) return true

  if (!isFiniteOrderedBounds(props.surface.bounds) || !isFiniteOrderedBounds(bounds)) return false

  const capsules = props.surface.capsuleBounds()
  const explicitBoxes = props.primitive.boxBounds?.()
  const context = { ...props, bounds, boxes: explicitBoxes?.length ? explicitBoxes : [bounds], capsules }

  return canSeparateSurfaceEnvelopes(context) || canSeparateSurfaceFields(context)
}
