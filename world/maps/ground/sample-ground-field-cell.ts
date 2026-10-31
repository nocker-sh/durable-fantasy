import { getRoadFieldSample } from "#/world/maps/ground/get-road-field-sample"
import { getTrailFieldDistance } from "#/world/maps/ground/get-trail-field-distance"
import type { GroundFieldContext } from "#/world/maps/ground/ground-field-types"

/** Write distance and material fields before height sampling, which reads the progressively generated road field. */
export function sampleGroundFieldCell(row: number, column: number, context: GroundFieldContext): void {
  const x = column / context.resolution
  const z = row / context.resolution
  const index = row * context.size + column
  const riverDistance = context.river.distance(x, z)
  context.fields.river[index] = riverDistance
  const road = getRoadFieldSample(x, z, context)
  context.fields.road[index] = road.distance
  context.fields.trail[index] = getTrailFieldDistance(x, z, context.trails)
  context.fields.roadKind[index] = road.kind
  context.fields.h[index] = context.heightAt({ x, z, dr: riverDistance, roads: context.roads })
}
