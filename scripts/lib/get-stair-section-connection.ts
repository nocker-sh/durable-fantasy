import { stairSectionRoomSchema } from "#/scripts/lib/stair-section-room-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { StairSection } from "#/scripts/lib/stair-section-types"

type Props = Readonly<{ buildingId: string; section: StairSection; documents: ReadonlyMap<string, SettingDocument> }>

/** Resolve only the fields needed by the section; never coerce a room's floor into a matching number. */
export function getStairSectionConnection(props: Props) {
  const lower = stairSectionRoomSchema.safeParse(props.documents.get(props.section.lower_room)),
    upper = stairSectionRoomSchema.safeParse(props.documents.get(props.section.upper_room))
  if (!lower.success || !upper.success || lower.data.building !== props.buildingId || upper.data.building !== props.buildingId || upper.data.floor !== lower.data.floor + 1)
    return new Error("Stair section has no matching floor connection")

  const connection = lower.data.connections.find((entry) => entry.kind === "stair" && entry.target === props.section.upper_room && entry.furniture === props.section.furniture)
  const stair = lower.data.furniture.find((entry) => entry.symbol === props.section.furniture),
    upperStair = upper.data.furniture.find((entry) => entry.symbol === connection?.target_furniture)
  if (!connection || !stair || !upperStair) return new Error("Stair section has no matching floor connection")

  return { lower: lower.data, upper: upper.data, connection, stair, upperStair }
}
