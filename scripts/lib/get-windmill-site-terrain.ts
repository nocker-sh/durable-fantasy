import { scalarFieldRange } from "#/lib/engine/scalar-field-range"
import type { ScalarField } from "#/lib/engine/scalar-field"
import type { WindmillSiteReview } from "#/scripts/lib/windmill-site-types"
type Props = Readonly<{ review: WindmillSiteReview; terrain: ScalarField; metresPerTile: number }>

/** Measure every clipped bilinear cell; heights describe the supplied terrain, not a designed foundation or a walkable slope. */
export function getWindmillSiteTerrain(props: Props) {
  if (!Number.isFinite(props.metresPerTile) || props.metresPerTile <= 0) throw new RangeError("Invalid terrain scale")
  const bounds = [props.review.footprint.rect, ...(props.review.approach?.bounds ?? [])]
  const limit = (props.terrain.size - 1.001) / props.terrain.resolution
  return bounds.map((rect, index) => {
    if (rect[0] < 0 || rect[1] < 0 || rect[2] > limit || rect[3] > limit) throw new RangeError("Windmill terrain region exceeds sampled field")
    const range = scalarFieldRange(props.terrain, rect)
    return {
      id: index === 0 ? props.review.footprint.id : `${props.review.footprint.id}/approach-${index}`,
      bounds: [...rect],
      minimum_m: range.min * props.metresPerTile,
      maximum_m: range.max * props.metresPerTile,
      relief_m: (range.max - range.min) * props.metresPerTile,
    }
  })
}
