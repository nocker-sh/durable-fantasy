import type { Layout } from "#/world/maps/layout-types"
import type { RoadPath } from "#/world/maps/ground/types"
import type { ScalarField } from "#/lib/engine/scalar-field"

export type GroundHeightContext = Readonly<{
  layout: Layout
  x: number
  z: number
  riverDistance: number
  plazaHeight: number
  roads: readonly RoadPath[]
  roadField: Pick<ScalarField, "sample">
}>
