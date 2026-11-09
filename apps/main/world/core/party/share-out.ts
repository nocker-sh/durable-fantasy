import { PARTY_BONUS, SHARE_LEVELS } from "#/world/core/party/rules"
import type { ShareMode } from "#/world/core/party/types"

type Participant = Readonly<{ owner: string; level: number }>
type Props = Readonly<{ exp: number; mode: ShareMode; killer: Participant; near: ReadonlyArray<Participant> }>

/**
 * 分ける人が増えるごとに少し足してから頭割りする。Lv 差は近くの仲間のいちばん高い Lv から測るので、
 * 低い Lv の仲間がとどめを刺しても上の仲間を外して一人で受け取れない（範囲の外なら経験は付かず、落とし物だけ受け取る）。
 * 端数は倒した人へ、倒した人が範囲の外なら最も高い Lv の人へ戻す。取り分のない仲間には送らない。
 */
export function shareOut(props: Props): { owner: string; exp: number }[] {
  if (props.mode === "own") return [{ owner: props.killer.owner, exp: props.exp }]

  const everyone = [props.killer, ...props.near.filter((member, index, all) => member.owner !== props.killer.owner && all.findIndex((other) => other.owner === member.owner) === index)]
  const top = everyone.reduce((best, member) => (member.level > best.level ? member : best), props.killer)
  const participants = everyone.filter((member) => top.level - member.level <= SHARE_LEVELS)
  const total = Math.floor(props.exp * (1 + PARTY_BONUS * (participants.length - 1)))
  const each = Math.floor(total / participants.length)
  const remainder = total - each * participants.length
  const rounding = participants.includes(props.killer) ? props.killer.owner : top.owner
  const shares = participants.map((member) => ({ owner: member.owner, exp: member.owner === rounding ? each + remainder : each }))

  return [...(participants.includes(props.killer) ? [] : [{ owner: props.killer.owner, exp: 0 }]), ...shares].filter((share) => share.owner === props.killer.owner || share.exp > 0)
}
