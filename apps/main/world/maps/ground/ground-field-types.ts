import type { Polyline } from "#/lib/engine/polyline"
import type { Fields, RoadPath } from "#/world/maps/ground/types"

export type GroundFieldBuffers = Readonly<Pick<Fields, "h" | "river" | "road" | "roadKind"> & { trail: Float32Array }>
export type GeneratedGroundFields = GroundFieldBuffers & Readonly<{ plazaH: number }>
export type GroundFieldContext = Readonly<{
  fields: GroundFieldBuffers
  river: Polyline
  trails: readonly Polyline[]
  roads: readonly RoadPath[]
  seed: number
  size: number
  resolution: number
  heightAt: (input: Readonly<{ x: number; z: number; dr: number; roads: readonly RoadPath[] }>) => number
}>
