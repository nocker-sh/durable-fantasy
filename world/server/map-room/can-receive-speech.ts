import { cellDistance } from "#/world/maps/cell-distance"
import { HEARING_CELLS } from "#/world/protocol"
import { reachable } from "#/world/server/map-room/reachable"
import type { Cell } from "#/world/maps/types"
import type { Presence } from "#/world/server/map-room/presence"

type Props = Readonly<{ senderId: string; recipientId: string; recipient: Presence; origin: Cell | undefined; shout: boolean }>

/** 叫び声は部屋全体へ、それ以外は発言者から届く範囲だけへ送る。 */
export function canReceiveSpeech(props: Props): boolean {
  if (props.recipientId === props.senderId || !props.recipient.player || props.recipient.closed) return false
  if (props.shout) return true
  const origin = props.origin
  if (!origin) return false
  return reachable(props.recipient).some((cell) => cellDistance(cell, origin) <= HEARING_CELLS)
}
