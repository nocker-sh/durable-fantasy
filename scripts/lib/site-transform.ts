export type SitePoint = readonly [number, number]
/** One quarter-turn convention for footprints, doorway centres and outward directions. */
export function siteTransform(width: number, depth: number, quarters: number) {
  const point = (x: number, z: number): SitePoint => (quarters === 1 ? [z, width - x] : quarters === 2 ? [width - x, depth - z] : quarters === 3 ? [depth - z, x] : [x, z])
  const direction = (x: number, z: number): SitePoint => {
    const result = quarters === 1 ? [z, -x] : quarters === 2 ? [-x, -z] : quarters === 3 ? [-z, x] : [x, z]
    return [result[0] === 0 ? 0 : result[0], result[1] === 0 ? 0 : result[1]]
  }
  return { point, direction, size: (quarters % 2 ? [depth, width] : [width, depth]) as SitePoint }
}
