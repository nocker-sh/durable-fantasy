import type { EntryApproachSurface } from "#/scripts/lib/entry-approach-surface-types"

type Props = Readonly<{ points: readonly (readonly [number, number])[]; widthM: number; elevationM: number; metresPerTile: number }>

/** The blend begins at the lower landing's outer edge; the preceding half-cap stays at landing height. */
export function getStraightEntryApproachSurfacePlan(props: Props): EntryApproachSurface | Error {
  if (
    props.points.length !== 2 ||
    ![props.widthM, props.elevationM, props.metresPerTile].every(Number.isFinite) ||
    props.widthM <= 0 ||
    props.metresPerTile <= 0 ||
    props.points.some((point) => !point.every(Number.isFinite))
  )
    return new Error("Invalid straight entry surface dimensions")

  const first = props.points[0]
  const road = props.points[1]
  const alongAxis = first[0] === road[0] ? 1 : 0
  if (first[1 - alongAxis] !== road[1 - alongAxis] || first[alongAxis] === road[alongAxis]) return new Error("Entry surface needs one straight nonzero leg")

  const direction = road[alongAxis] > first[alongAxis] ? 1 : -1
  const half = props.widthM / props.metresPerTile / 2
  if (!Number.isFinite(half) || half <= 0 || !Number.isFinite((road[alongAxis] - first[alongAxis]) * props.metresPerTile)) return new Error("Invalid straight entry surface dimensions")

  const levelBounds: [number, number, number, number] = [first[0] - half, first[1] - half, first[0] + half, first[1] + half]
  const blendBounds: [number, number, number, number] = [Math.min(first[0], road[0]) - half, Math.min(first[1], road[1]) - half, Math.max(first[0], road[0]) + half, Math.max(first[1], road[1]) + half]
  levelBounds[alongAxis + (direction === 1 ? 2 : 0)] = first[alongAxis]
  blendBounds[alongAxis + (direction === 1 ? 0 : 2)] = first[alongAxis]

  if (![...levelBounds, ...blendBounds].every(Number.isFinite) || levelBounds[0] === levelBounds[2] || levelBounds[1] === levelBounds[3]) return new Error("Invalid straight entry surface dimensions")

  return { levelBounds, blendBounds, alongAxis, direction, start: first[alongAxis], end: road[alongAxis], elevationM: props.elevationM, metresPerTile: props.metresPerTile }
}
