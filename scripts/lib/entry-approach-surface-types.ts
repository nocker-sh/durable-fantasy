export type EntryApproachSurface = Readonly<{
  levelBounds: readonly [number, number, number, number]
  blendBounds: readonly [number, number, number, number]
  alongAxis: 0 | 1
  direction: 1 | -1
  start: number
  end: number
  elevationM: number
  metresPerTile: number
}>
