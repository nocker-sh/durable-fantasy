import type { Rectangle } from "#/lib/engine/rectangle-subtraction"
import type { RectangleSide } from "#/lib/engine/rectangle-face"
import type { FlueSection } from "#/world/town/floorplan/types"
export type HearthSpec = Readonly<{ height: number; openingBottom: number; openingTop: number; openingWidth: number; openingOffset: number; chamberDepth: number }>
export type HearthChamberInput = Readonly<{ bounds: Rectangle; front: RectangleSide; spec: HearthSpec; bottom: number }>
export type HearthPartsInput = HearthChamberInput & Readonly<{ shaft: FlueSection }>
