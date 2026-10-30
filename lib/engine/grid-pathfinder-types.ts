export type GridPathfinderProps = Readonly<{
  blocked: Uint8Array
  size: number
  resolution: number
  /** World-space corner offset for shortcut sampling; occupancy must already account for body clearance. */
  clearance: number
}>
