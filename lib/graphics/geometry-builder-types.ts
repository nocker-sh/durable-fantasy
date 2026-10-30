import type { Material } from "three"
import type { Vector3 } from "#/lib/engine/vector3-types"

type UV = readonly [number, number]
export type TriangleProps = { material: Material; a: Vector3; b: Vector3; c: Vector3; uvA: UV; uvB: UV; uvC: UV }
export type QuadProps = { material: Material; a: Vector3; b: Vector3; c: Vector3; d: Vector3; repeatU?: number; repeatV?: number; offsetU?: number; offsetV?: number }
export type BoxProps = { side: Material; top: Material | null; x0: number; y0: number; z0: number; x1: number; y1: number; z1: number; repeat?: number; bottom?: boolean }
export type CylinderProps = {
  side: Material
  top: Material | null
  centerX: number
  centerZ: number
  fromY: number
  toY: number
  fromRadius: number
  toRadius?: number
  segments?: number
  repeat?: number
}
export type GeometryGroupSnapshot = Readonly<{ pos: ReadonlyArray<number>; uv: ReadonlyArray<number> }>
