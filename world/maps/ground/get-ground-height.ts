import { baseH } from "#/world/maps/ground/base-h"
import { getPlazaGroundHeight } from "#/world/maps/ground/get-plaza-ground-height"
import { getTerraceGroundHeight } from "#/world/maps/ground/get-terrace-ground-height"
import { getRiverGroundHeight } from "#/world/maps/ground/get-river-ground-height"
import { getLavoirGroundHeight } from "#/world/maps/ground/get-lavoir-ground-height"
import { getShapedGroundHeight } from "#/world/maps/ground/get-shaped-ground-height"
import type { GroundHeightContext } from "#/world/maps/ground/ground-height-types"

/** Surface order is shared by the renderer and headless terrain generation. */
export function getGroundHeight(context: GroundHeightContext): number {
  const base = baseH(context.x, context.z, context.layout)
  const plaza = getPlazaGroundHeight(context, base)
  const terrace = getTerraceGroundHeight(context, plaza)
  const river = getRiverGroundHeight(context, terrace)
  const lavoir = getLavoirGroundHeight(context, river)
  return getShapedGroundHeight(context, lavoir)
}
