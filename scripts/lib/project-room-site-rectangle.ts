import type { SpatialFrame } from "#/lib/engine/spatial-frame"

type Props = Readonly<{ frame: SpatialFrame; origin: readonly [number, number]; cellMetres: number; rect: readonly [number, number, number, number]; metresPerTile: number }>

/** Corners may extend beyond the room for a reservation, but their projected bounds must remain ordered and finite. */
export function projectRoomSiteRectangle(props: Props): readonly [number, number, number, number] | Error {
  const rect = props.rect
  const corners = [rect[0], rect[0] + rect[2]].flatMap((x) =>
    [rect[1], rect[1] + rect[3]].map((z) => props.frame.toWorld([(props.origin[0] * props.cellMetres + x) / props.metresPerTile, 0, (props.origin[1] * props.cellMetres + z) / props.metresPerTile])),
  )
  const bounds: readonly [number, number, number, number] = [
    Math.min(...corners.map((point) => point[0])),
    Math.min(...corners.map((point) => point[2])),
    Math.max(...corners.map((point) => point[0])),
    Math.max(...corners.map((point) => point[2])),
  ]
  if (!bounds.every(Number.isFinite) || bounds[0] >= bounds[2] || bounds[1] >= bounds[3]) return new Error("Unbounded room site rectangle")
  return bounds
}
