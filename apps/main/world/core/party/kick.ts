import { leave } from "#/world/core/party/leave"
import type { Party } from "#/world/core/party/types"

type Props = Readonly<{ party: Party; leader: string; target: string }>

/** リーダーだけが、自分以外の仲間を外せる。外せないときは null。 */
export function kick(props: Props): Party | null {
  if (props.party.leader !== props.leader || props.target === props.leader) return null
  if (!props.party.members.some((member) => member.owner === props.target)) return null
  return leave(props.party, props.target)
}
