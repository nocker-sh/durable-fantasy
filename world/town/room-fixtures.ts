export type WindowFixture = {
  id: string
  floor: number
  side: "n" | "e" | "s" | "w"
  along: number
  width: number
  sill: number
  height: number
  frame: number
}
export type FramedWindow = {
  floor?: number
  id: string
  point: readonly [number, number]
  outward: readonly [number, number]
  width: number
  sill: number
  height: number
  depth: number
  frame: number
}
export type LampFixture = { id: string; floor: number; x: number; z: number; bottom: number; top: number; diameter: number; ceiling: number }

export type ActivitySpot = {
  resident: string
  kind: "lesson" | "records"
  role?: "teacher" | "student"
  floor: number
  x: number
  z: number
  facing?: readonly [number, number]
  seat?: { x: number; z: number; height: number; forward: number; facing?: import("./seat-orientation").SeatFacing }
}

/** Physical chair dimensions, in metres before interior projection. */
export type SeatSpec = {
  facing?: import("./seat-orientation").SeatFacing
  width: number
  depth: number
  height: number
  backHeight: number
  boardThickness: number
  legWidth: number
  occupantForward?: number
  footRest?: { height: number; width: number; depth: number; forward: number; thickness: number }
}

export type WorkSurfaceSpec = { height: number; thickness: number; legWidth: number; legInset: number; kneeClearance: number }
