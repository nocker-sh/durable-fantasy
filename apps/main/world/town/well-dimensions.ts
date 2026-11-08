/** Native outdoor tiles; drawing and authored collection-floor checks share the existing collision radius. */
export const WELL_BLOCK_RADIUS_TILES = 1.05

export const WELL_PLACE_OFFSETS_TILES: Readonly<Record<"well" | "well2", readonly [number, number]>> = { well: [0, 1.4], well2: [-1.4, 0] }
