import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"

export type WorkingToolDimensions = {
  width: number
  thickness: number
  length: number
  gripFromBlade: number
  handleWidth: number
  bladeLength: number
}

export type WorkingToolGeometry = {
  axes: readonly [Point3, Point3, Point3]
  parts: { part: "blade" | "handle"; bounds: Cuboid }[]
}

export type ToolGripProfile = {
  across: Point3
  halfWidth: number
  halfDepth: number
}
