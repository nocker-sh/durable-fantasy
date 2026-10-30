import type { RoadPath } from "#/world/scene/world"
import { layout, PLAZA_H, roadField } from "#/world/scene/world"
import { baseH } from "#/world/scene/helpers/world/base-h"
import { getPlazaGroundHeight } from "#/world/scene/helpers/world/get-plaza-ground-height"
import { getTerraceGroundHeight } from "#/world/scene/helpers/world/get-terrace-ground-height"
import { getRiverGroundHeight } from "#/world/scene/helpers/world/get-river-ground-height"
import { getLavoirGroundHeight } from "#/world/scene/helpers/world/get-lavoir-ground-height"
import { getShapedGroundHeight } from "#/world/scene/helpers/world/get-shaped-ground-height"
import type { GroundHeightContext } from "#/world/scene/helpers/world/ground-height-types"

type Props = Readonly<{ x: number; z: number; dr: number; roads: readonly RoadPath[] }>

/** Apply ground features in the same order as their visible surfaces, sharing one sampling context. */
export function computeH(props: Props): number {
  const context: GroundHeightContext = { layout: layout.value, x: props.x, z: props.z, riverDistance: props.dr, plazaHeight: PLAZA_H.value, roads: props.roads, roadField }
  const base = baseH(context.x, context.z, context.layout)
  const plaza = getPlazaGroundHeight(context, base)
  const terrace = getTerraceGroundHeight(context, plaza)
  const river = getRiverGroundHeight(context, terrace)
  const lavoir = getLavoirGroundHeight(context, river)
  return getShapedGroundHeight(context, lavoir)
}
