import type { FramedWindow } from "#/world/town/room-fixtures"
export type BuildingEnvelope = {
  windows: readonly FramedWindow[]
  id: string
  bounds: readonly [number, number, number, number]
  floorY: number
  eaveY: number
  ridgeY: number
  overhang: number
  ridgeAxis: "x" | "z"
  roof: "roof" | "roof2" | "slate" | "thatch"
  door: {
    point: readonly [number, number]
    outward: readonly [number, number]
    width: number
    height: number
    handleAlong: number
    braceProjection: number
    handleProjection: number
    leafBottom: number
    leafTop: number
    recess: number
    leafThickness: number
    frameInset: number
    hingeSign: number
  }
  steps: readonly { rect: readonly [number, number, number, number]; height: number }[]
  railInset: number
  railHeight: number
  chimneys: readonly { rect: readonly [number, number, number, number]; top: number; wallThickness: number }[]
}
