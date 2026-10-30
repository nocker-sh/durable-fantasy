import type { Vector3 } from "./vector3-types"
export type TwoBoneTarget = Readonly<{ root: Vector3; target: Vector3; upper: number; lower: number; pole: Vector3 }>
export type TwoBoneSegment = Readonly<{ root: Vector3; from: Vector3; to: Vector3; upper: number; lower: number }>

export type TwoBoneSolution = { joint: Vector3; end: Vector3 }
