import { Polyline } from "#/lib/engine/polyline"
import { getIntegerRange } from "#/lib/engine/get-integer-range"
import { FR, GN, layout, F, PLAZA_H } from "#/world/scene/world"
import { baseH } from "#/world/scene/helpers/world/base-h"
import { computeH } from "#/world/scene/helpers/world/compute-h"
import { getGroundRoadPaths } from "#/world/scene/helpers/world/get-ground-road-paths"
import { sampleGroundFieldCell } from "#/world/scene/helpers/world/sample-ground-field-cell"
import type { GroundFieldContext } from "#/world/scene/helpers/world/ground-field-types"

/** Generate row-first so height sampling observes the same partial road field as the stored ground format. */
export function computeFields(): void {
  const river = new Polyline(layout.value.river)
  const trails = (layout.value.trails ?? []).map((points) => new Polyline(points))
  const roads = getGroundRoadPaths(layout.value.roads)
  const context: GroundFieldContext = { river, trails, roads, fields: F, size: GN, resolution: FR, seed: layout.value.seed, heightAt: computeH }
  PLAZA_H.value = baseH(layout.value.plaza[0], layout.value.plaza[1], layout.value)
  const cells = getIntegerRange(0, GN)
  for (const row of cells) for (const column of cells) sampleGroundFieldCell(row, column, context)
}
