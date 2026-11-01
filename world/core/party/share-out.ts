import { PARTY_BONUS, SHARE_LEVELS } from "#/world/core/party/rules"
import type { ShareMode } from "#/world/core/party/types"

type Participant = Readonly<{ owner: string; level: number }>
type Props = Readonly<{ exp: number; mode: ShareMode; killer: Participant; near: ReadonlyArray<Participant> }>

/** 分ける人が増えるごとに少し足してから頭割りし、端数は倒した人へ戻す。取り分のない仲間には送らない。 */
export function shareOut(props: Props): { owner: string; exp: number }[] {
  if (props.mode === "own") return [{ owner: props.killer.owner, exp: props.exp }]

  const participants = [props.killer, ...props.near.filter((member) => member.owner !== props.killer.owner && Math.abs(member.level - props.killer.level) <= SHARE_LEVELS)]
  const total = Math.floor(props.exp * (1 + PARTY_BONUS * (participants.length - 1)))
  const each = Math.floor(total / participants.length)
  const remainder = total - each * participants.length

  return participants
    .map((member) => ({ owner: member.owner, exp: member.owner === props.killer.owner ? each + remainder : each }))
    .filter((share) => share.owner === props.killer.owner || share.exp > 0)
}
