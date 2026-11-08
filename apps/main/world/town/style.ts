export type RoofShape = "gable" | "hip" | "shed"

export type WallKind = "plaster" | "timber" | "stone" | "board"

export type WindowKind = "leaded" | "square" | "small"

export type DoorKind = "plank" | "arched" | "double"

export type HouseStyle = {
  roofShape: RoofShape
  wall: WallKind
  /** the roof's ramp (scene/pix.ts): its material is the table's (tiles, slate or thatch), the colour the house's */
  roofRamp: "roof" | "roof2" | "roof3" | "slate" | "slate2" | "thatch"
  windows: WindowKind
  /** shutter colour ramp */
  shutter: string
  door: DoorKind
  /** chimneys: none for a barn, two where the hearth and a work fire are apart */
  chimneys: 0 | 1 | 2
  /** the upper floor overhangs the lower (timber houses of two floors) */
  jetty: boolean
}
