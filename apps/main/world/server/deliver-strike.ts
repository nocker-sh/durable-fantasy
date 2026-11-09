import type { WildContext, StrikePlayer, CombatNotice } from "#/world/server/wild-coordinator"
import { deliverCombat } from "#/world/server/deliver-combat"

type Props = {
  context: WildContext
  players: (owner: string) => StrikePlayer
  owner: string
  id: number
}

/** A separate RPC ensures effects cannot escape before their hit and rolls are durable. */
export async function deliverStrike(props: Props): Promise<CombatNotice[]> {
  const job = props.context.state.jobs[props.owner]
  if (!job || job.id !== props.id || job.phase !== "done") return []
  return deliverCombat(
    props.context,
    props.players,
    (job.deliveries ?? []).map((entry) => entry.owner),
  )
}
