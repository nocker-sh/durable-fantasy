import type { Inbox } from "#/world/core/exchange-types"
type Props = { inbox: Record<string, Inbox>; owner: string; gold: number; item?: Inbox["items"][number] }

/** Mutate the caller's working copy, merging only identical item, quality and maker marks. */
export function creditExchangeInbox(props: Props) {
  const box = (props.inbox[props.owner] ??= { gold: 0, items: [] })
  box.gold += props.gold
  const item = props.item
  if (item && item.count > 0) {
    const same = box.items.find((candidate) => candidate.item === item.item && candidate.q === item.q && candidate.by === item.by)
    if (same) same.count += item.count
    else box.items.push({ ...item })
  }
}
