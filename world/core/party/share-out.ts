import { SHARE_LEVELS } from "#/world/core/party/rules"
import type { ShareMode } from "#/world/core/party/types"

type Participant = Readonly<{ owner: string; level: number }>
type Props = Readonly<{ exp: number; mode: ShareMode; killer: Participant; near: ReadonlyArray<Participant> }>

/** 端数は倒した人へ戻し、分配の合計が元の経験値を超えないようにする。 */
export function shareOut(props: Props): { owner: string; exp: number }[] {
  if (props.mode === "own") return [{ owner: props.killer.owner, exp: props.exp }]

  const participants = [props.killer, ...props.near.filter((member) => member.owner !== props.killer.owner && Math.abs(member.level - props.killer.level) <= SHARE_LEVELS)]
  const each = Math.floor(props.exp / participants.length)
  const remainder = props.exp - each * participants.length

  return participants.map((member) => ({ owner: member.owner, exp: member.owner === props.killer.owner ? each + remainder : each }))
}
