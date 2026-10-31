import { SpatialFrame } from "#/lib/engine/spatial-frame"

export type SitePoint = readonly [number, number]

/** One quarter-turn convention for footprints, doorway centres and outward directions. */
export function siteTransform(width: number, depth: number, quarters: number) {
  const frame = new SpatialFrame({ origin: [0, 0, 0], width, depth, quarterTurns: quarters })
  const point = (x: number, z: number): SitePoint => {
    const position = frame.toWorld([x, 0, z])
    return [position[0], position[2]]
  }
  const direction = (x: number, z: number): SitePoint => {
    const vector = frame.direction([x, 0, z])
    return [vector[0], vector[2]]
  }
  return { point, direction, size: frame.size }
}
