import { stairFurnitureSchema } from "#/scripts/lib/room-connection-schema"
import { same } from "#/scripts/lib/building-layout/same"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Connection } from "#/scripts/lib/building-layout"

type Props = Readonly<{ room: SettingDocument; target: SettingDocument; origin: readonly [number, number]; targetOrigin: readonly [number, number]; connection: Connection }>

/** This compares planar stair footprints and furniture use positions, not headroom or a full stair volume. */
export function auditConnectedRoomStair(props: Props): string[] {
  const errors: string[] = [],
    sourceFurniture = stairFurnitureSchema.safeParse(props.room.furniture),
    targetFurniture = stairFurnitureSchema.safeParse(props.target.furniture)

  if (!sourceFurniture.success || !targetFurniture.success) return [`${props.room.id}: invalid stair furniture`]

  const source = sourceFurniture.data.find((furniture) => furniture.symbol === props.connection.furniture),
    target = targetFurniture.data.find((furniture) => furniture.symbol === props.connection.target_furniture)

  if (
    !source ||
    !target ||
    typeof props.room.floor !== "number" ||
    typeof props.target.floor !== "number" ||
    Math.abs(props.target.floor - props.room.floor) !== 1 ||
    !same(
      [props.origin[0] + source.rect[0], props.origin[1] + source.rect[1], ...source.rect.slice(2)],
      [props.targetOrigin[0] + target.rect[0], props.targetOrigin[1] + target.rect[1], ...target.rect.slice(2)],
    )
  )
    errors.push(`${props.room.id}: stairs do not align between adjacent floors`)

  if (!source?.access.some((position) => same(position, props.connection.access)) || !target?.access.some((position) => same(position, props.connection.target_access)))
    errors.push(`${props.room.id}: stair endpoints are not furniture use positions`)

  return errors
}
