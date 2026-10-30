/** Horizontal occupied ground in outdoor tiles; these are not thermal or operating clearances. */
export const FORGE_GROUND_HALF_SIZE = [0.7, 0.6] as const
export const ANVIL_GROUND_RADIUS = 0.35
export const WOODPILE_GROUND_HALF_DEPTH = 0.6
export function groundRect(centre: readonly [number, number], halfWidth: number, halfDepth: number): readonly [number, number, number, number] {
  return [centre[0] - halfWidth, centre[1] - halfDepth, centre[0] + halfWidth, centre[1] + halfDepth]
}
