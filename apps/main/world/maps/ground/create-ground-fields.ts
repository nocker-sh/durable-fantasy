import { Polyline } from "#/lib/engine/polyline"
import { ScalarField } from "#/lib/engine/scalar-field"
import { getIntegerRange } from "#/lib/engine/get-integer-range"
import { FR, GN } from "#/world/maps/ground/rules"
import { baseH } from "#/world/maps/ground/base-h"
import { getGroundHeight } from "#/world/maps/ground/get-ground-height"
import { getGroundRoadPaths } from "#/world/maps/ground/get-ground-road-paths"
import { sampleGroundFieldCell } from "#/world/maps/ground/sample-ground-field-cell"
import { createGroundFieldBuffers } from "#/world/maps/ground/create-ground-field-buffers"
import type { GroundFieldContext, GeneratedGroundFields } from "#/world/maps/ground/ground-field-types"
import type { Layout } from "#/world/maps/layout-types"

/** Generate row-first against owned buffers; no selected scene, renderer or global cache is read. */
export function createGroundFields(layout: Layout): GeneratedGroundFields {
  const fields = createGroundFieldBuffers(),
    roadField = new ScalarField({ samples: fields.road, size: GN, resolution: FR }),
    plazaH = baseH(layout.plaza[0], layout.plaza[1], layout)
  const context: GroundFieldContext = {
    river: new Polyline(layout.river),
    trails: (layout.trails ?? []).map((points) => new Polyline(points)),
    roads: getGroundRoadPaths(layout.roads),
    fields,
    size: GN,
    resolution: FR,
    seed: layout.seed,
    heightAt: (input) => getGroundHeight({ layout, x: input.x, z: input.z, riverDistance: input.dr, roads: input.roads, roadField, plazaHeight: plazaH }),
  }
  const cells = getIntegerRange(0, GN)
  for (const row of cells) for (const column of cells) sampleGroundFieldCell(row, column, context)
  return { ...fields, plazaH }
}
