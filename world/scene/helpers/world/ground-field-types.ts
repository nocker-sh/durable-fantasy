import type { Polyline } from "#/lib/engine/polyline"
import type { Fields, RoadPath } from "#/world/scene/world"
import type { computeH } from "#/world/scene/helpers/world/compute-h"

export type GroundFieldBuffers = Readonly<Pick<Fields, "h" | "river" | "road" | "roadKind"> & { trail: Float32Array }>
export type GroundFieldContext = Readonly<{
  fields: GroundFieldBuffers
  river: Polyline
  trails: readonly Polyline[]
  roads: readonly RoadPath[]
  seed: number
  size: number
  resolution: number
  heightAt: typeof computeH
}>
