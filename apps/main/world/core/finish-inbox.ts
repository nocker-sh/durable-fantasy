import type { ExchangeState } from "#/world/core/exchange-types"
import type { ExchangeClaims } from "#/world/core/exchange-claim-types"
type Props = Readonly<{ ex: ExchangeState; delivery: ExchangeClaims; owner: string; id: number; accepted: boolean }>

/** Only explicit refusal restores the reserved goods, after any arrivals received while delivery was pending; an empty box is not kept. */
export function finishInbox(props: Props): { ex: ExchangeState; delivery: ExchangeClaims } {
  const claim = props.delivery.claims[props.owner]
  if (!claim || claim.id !== props.id) return { ex: props.ex, delivery: props.delivery }
  const claims = { ...props.delivery.claims }
  delete claims[props.owner]
  const completed = { ex: props.ex }
  if (!props.accepted) {
    const box = props.ex.inbox[props.owner] ?? { gold: 0, items: [] }
    const restored = { gold: box.gold + claim.inbox.gold, items: [...box.items, ...claim.inbox.items] }
    if (restored.gold !== 0 || restored.items.length > 0) completed.ex = { ...props.ex, inbox: { ...props.ex.inbox, [props.owner]: restored } }
  }
  return { ex: completed.ex, delivery: { ...props.delivery, claims } }
}
