import type { SettingDocument } from "#/scripts/lib/setting-document"

type Props = Readonly<{ building: SettingDocument; roomId: string; targetId: string; kind: string; target: SettingDocument | undefined }>

/** Room-local coordinates can be compared within one registered building frame. */
export function getRoomConnectionScopeError(props: Props): string | null {
  if (!["door", "opening", "stair"].includes(props.kind)) return `${props.roomId}: unknown connection kind`
  if (!props.target) return `${props.roomId}: connection target ${props.targetId} is missing`
  if (props.target.kind !== "rooms" && props.target.kind !== "maps") return `${props.roomId}: connection target ${props.targetId} is not a room or map`
  if (props.kind === "stair" && props.target.kind !== "rooms") return `${props.roomId}: stair connection target is not a room`
  if (props.target.kind !== "rooms") return null
  if (props.target.building !== props.building.id) return `${props.roomId}: connection to ${props.targetId} uses another building frame`
  if (!Array.isArray(props.building.rooms) || !props.building.rooms.includes(props.target.id)) return `${props.roomId}: connection to ${props.targetId} is outside the building inventory`
  return null
}
