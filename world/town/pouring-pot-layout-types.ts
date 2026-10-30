import type { getPouringPotProfile } from "#/world/town/get-pouring-pot-profile"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { Rectangle } from "#/lib/engine/rectangle-subtraction"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
export type PouringPotLayoutInput = Readonly<{
  profile: Exclude<ReturnType<typeof getPouringPotProfile>, Error>
  stove: Rectangle
  plate: Cuboid
  masonry: readonly Cuboid[]
  shaft: Rectangle
  heating: readonly [number, number]
  resting: readonly [number, number]
  restArea: readonly [number, number, number, number]
}>
export type PouringPotStations = Readonly<{ heating: Point3; resting: Point3; heated: Cuboid; rested: Cuboid; area: Rectangle; heading: number }>
