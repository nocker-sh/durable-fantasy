import { getScalarGridAxisSamples } from "#/lib/engine/get-scalar-grid-axis-samples"
import { getEntryApproachSurfaceHeight } from "#/scripts/lib/get-entry-approach-surface-height"
import type { ScalarField } from "#/lib/engine/scalar-field"
import type { EntryApproachSurface } from "#/scripts/lib/entry-approach-surface-types"

type Props = Readonly<{ surface: EntryApproachSurface; terrain: ScalarField }>

/** Surface minus terrain is bilinear between grid lines and blend boundaries, so corner extrema cover the full width. */
export function getEntryApproachEarthworks(props: Props): { cutM: number; fillM: number } | Error {
  const surface = props.surface
  if (
    !Number.isSafeInteger(props.terrain.size) ||
    props.terrain.size < 2 ||
    !Number.isFinite(props.terrain.resolution) ||
    props.terrain.resolution <= 0 ||
    props.terrain.sampleCount < props.terrain.size ** 2
  )
    return new Error("Invalid entry surface terrain")
  const limit = (props.terrain.size - 1.001) / props.terrain.resolution
  const differences: number[] = []
  for (const bounds of [surface.levelBounds, surface.blendBounds]) {
    if (!bounds.every(Number.isFinite) || bounds[0] > bounds[2] || bounds[1] > bounds[3] || bounds[0] < 0 || bounds[1] < 0 || bounds[2] > limit || bounds[3] > limit)
      return new Error("Entry surface exceeds sampled terrain")
    const cuts = [surface.start, surface.end]
    const xs = [...getScalarGridAxisSamples(props.terrain, bounds[0], bounds[2]), ...cuts.filter((value) => surface.alongAxis === 0 && value >= bounds[0] && value <= bounds[2])]
    const zs = [...getScalarGridAxisSamples(props.terrain, bounds[1], bounds[3]), ...cuts.filter((value) => surface.alongAxis === 1 && value >= bounds[1] && value <= bounds[3])]
    for (const x of xs)
      for (const z of zs) {
        const height = getEntryApproachSurfaceHeight({ ...props, point: [x, z] })
        if (height instanceof Error) return height
        const difference = height - props.terrain.sample(x, z) * surface.metresPerTile
        if (!Number.isFinite(difference)) return new Error("Non-finite entry earthworks")
        differences.push(difference)
      }
  }

  return differences.reduce((range, difference) => ({ cutM: Math.max(range.cutM, -difference), fillM: Math.max(range.fillM, difference) }), { cutM: 0, fillM: 0 })
}
