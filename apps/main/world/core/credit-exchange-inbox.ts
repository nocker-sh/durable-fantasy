import type { Inbox } from "#/world/core/exchange-types"
type Props = { inbox: Record<string, Inbox>; owner: string; gold: number; item?: Inbox["items"][number] }

/** Mutate the caller's working copy, merging only identical item, quality and maker marks; nothing credited opens no box. */
export function creditExchangeInbox(props: Props) {
  const item = props.item && props.item.count > 0 ? props.item : null
  if (props.gold === 0 && !item) return
  const box = (props.inbox[props.owner] ??= { gold: 0, items: [] })
  box.gold += props.gold
  if (item) {
    const same = box.items.find((candidate) => candidate.item === item.item && candidate.q === item.q && candidate.by === item.by && candidate.dur === item.dur)
    if (same) same.count += item.count
    else box.items.push({ ...item })
  }
}
