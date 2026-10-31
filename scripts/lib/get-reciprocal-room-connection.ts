import { same } from "#/scripts/lib/building-layout/same"
import type { Connection } from "#/scripts/lib/building-layout"

type Props = Readonly<{ roomId: string; connection: Connection; candidates: readonly Connection[] }>

/** Matching both endpoint descriptions prevents an unrelated return path from acknowledging this opening. */
export function getReciprocalRoomConnection(props: Props): Connection | undefined {
  return props.candidates.find((candidate) => {
    if (candidate.target !== props.roomId) return false
    if (props.connection.kind === "stair") {
      if (candidate.kind !== "stair" || candidate.furniture !== props.connection.target_furniture || candidate.target_furniture !== props.connection.furniture) return false
      return same(candidate.access, props.connection.target_access) && same(candidate.target_access, props.connection.access)
    }
    return same(candidate.door, props.connection.target_door) && same(candidate.target_door, props.connection.door)
  })
}
