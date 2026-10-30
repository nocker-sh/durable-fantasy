import type { Skel } from "#/world/scene/rig"
import type { Point3 } from "../../../lib/engine/cuboid-motion-types"
export type NativeGroundPose = Readonly<{ skeleton: Skel; rootY: number; body: readonly [number, number] }>
export type NativeGroundContact = Readonly<{ id: string; point: Point3 }>
