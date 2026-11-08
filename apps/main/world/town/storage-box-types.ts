export type LidHandleDimensions = {
  span: number
  depth: number
  height: number
  thickness: number
  /** Offset in the handle's span/depth axes, measured from the lid centre. */
  offset?: readonly [number, number]
}
export type StorageBoxHandle = LidHandleDimensions & {
  axis: "x" | "z"
}
export type StorageBoxDimensions = {
  width: number
  depth: number
  height: number
  wall?: number
  lid?: number
  lidHandle?: LidHandleDimensions
}
export type StorageBoxBounds = {
  x0: number
  y0: number
  z0: number
  x1: number
  y1: number
  z1: number
}
export type StorageBoxPart = StorageBoxBounds & {
  part: "bottom" | "side" | "lid" | "lid-handle"
}
export type StorageBoxPartsInput = Readonly<{ bounds: StorageBoxBounds; wall: number; lid: number; lift?: number; handle?: StorageBoxHandle }>
