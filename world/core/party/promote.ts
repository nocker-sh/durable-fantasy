import type { Party } from "#/world/core/party/types"

type Props = Readonly<{ party: Party; leader: string; target: string }>

/** リーダーだけが、ほかの仲間にリーダーを任せられる。任せられないときは null。 */
export function promote(props: Props): Party | null {
  if (props.party.leader !== props.leader || props.target === props.leader) return null
  if (!props.party.members.some((member) => member.owner === props.target)) return null
  return { ...props.party, leader: props.target }
}
