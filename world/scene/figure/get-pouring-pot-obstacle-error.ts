import { certifyFieldSeparation } from "#/lib/engine/field-separation"
import { segmentCuboidDistance } from "#/lib/engine/segment-cuboid-distance"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { BoundedField } from "#/lib/engine/field-separation"
import type { getPouringPotNativeParts } from "./get-pouring-pot-native-parts"
type Props = { parts: Exclude<ReturnType<typeof getPouringPotNativeParts>, Error>; fields: readonly BoundedField[]; box: Cuboid }

/** 杯の空洞へ胴を入れず、握りを含む全ての柄も家具から離す。 */
export function getPouringPotObstacleError(props: Props): Error | null {
  const box = props.box
  const obstacle: BoundedField = { min: [box.x0, box.bottom, box.z0], max: [box.x1, box.top, box.z1], value: () => 0, lipschitz: 1 }
  if (!props.fields.length || props.fields.some((field) => !certifyFieldSeparation(field, obstacle))) return new Error("Pouring pot clearance from the table or cups remains unresolved")
  if (
    !props.parts.bars.length ||
    props.parts.bars.some(
      (bar) => !bar.from.every(Number.isFinite) || !bar.to.every(Number.isFinite) || !Number.isFinite(bar.radius) || bar.radius <= 0 || !(segmentCuboidDistance(box, bar.from, bar.to) >= bar.radius),
    )
  )
    return new Error("Pouring pot handle clearance from the table or cups remains unresolved")
  return null
}
