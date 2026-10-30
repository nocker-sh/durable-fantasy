import type { Vector3 } from "../../engine/vector3-types"

export type ConeFrame = Readonly<{ u: Vector3; v: Vector3; w: Vector3; h: number }>

export type ConeEndpoints = Readonly<{ a: Vector3; b: Vector3 }>
