import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
export type SlidingCabinetSpec = Readonly<{
  bounds: Cuboid
  storageFloor: number
  board: number
  legWidth: number
  panel: number
  guide: number
  overlap: number
  rearTravel: number
  pull: Readonly<{ bottom: number; height: number; width: number; fromMeeting: number; southFromMeeting: number; southWidth: number }>
}>
export type SlidingCabinetPart = Cuboid & Readonly<{ part: "frame" | "leg" | "guide" | "panel" | "handle-post" | "handle-bar"; leaf: "north" | "south" | null }>
