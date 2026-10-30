import { getHotWaterStationSolids } from "#/scripts/lib/get-hot-water-station-solids"
import { getPouringPotNativeParts } from "#/world/scene/figure/get-pouring-pot-native-parts"
import { getPouringPotBodyFields } from "#/world/scene/figure/get-pouring-pot-body-fields"
import { getPouringPotObstacleError } from "#/world/scene/figure/get-pouring-pot-obstacle-error"
import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
import type { HotWaterPosedContext as Props } from "#/scripts/lib/hot-water-frame-types"

/** 台と杯には身体と同じ座標変換で器全体を照合する。 */
export function getHotWaterPotStationError(props: Props): Error | null {
  const native = { profile: props.definition.profile, pose: props.pose, body: props.body, heading: Math.PI, rootY: props.posed.rootY }
  const parts = getPouringPotNativeParts(native)
  const fields = getPouringPotBodyFields(native)
  const solids = getHotWaterStationSolids(props)
  if (parts instanceof Error) return parts
  if (fields instanceof Error) return fields
  if (solids instanceof Error) return solids
  for (const solid of solids) {
    const box = toHeadingLocalCuboid({ box: solid, root: [props.body[0], props.posed.rootY, props.body[1]], heading: Math.PI })
    if (box instanceof Error) return box
    const invalid = getPouringPotObstacleError({ parts, fields, box })
    if (invalid) return new Error(invalid.message, { cause: { solid, error: invalid } })
  }
  return null
}
