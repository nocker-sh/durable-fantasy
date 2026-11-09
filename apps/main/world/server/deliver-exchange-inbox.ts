import { finishInbox } from "#/world/core/finish-inbox"
import type { Transition } from "#/world/core/transition"
import type { ExchangeContext, ExchangePlayers } from "#/world/server/exchange-coordinator"
import { RETRY_MS } from "#/world/server/exchange-coordinator"

type Props = {
  context: ExchangeContext
  players: ExchangePlayers
  owner: string
  id: number
}

export async function deliverExchangeInbox(props: Props): Promise<Transition> {
  const claim = props.context.state.delivery.claims[props.owner]
  if (!claim || claim.id !== props.id) return (await props.players(props.owner).inboxReceipt(props.id)) ?? { ok: false, reason: "NOT_READY" }
  await props.context.setAlarm(Date.now() + RETRY_MS)
  const result = await props.players(props.owner).receiveInbox(claim)
  Object.assign(props.context.state, finishInbox({ ex: props.context.state.ex, delivery: props.context.state.delivery, owner: props.owner, id: props.id, accepted: result.ok }))
  return result
}
