import type { Presence, TradeSide } from "#/world/server/map-room/presence"

type Props = Readonly<{
  sender: Readonly<{ id: string; presence: Presence }>
  recipient: Readonly<{ id: string; presence: Presence }>
  session: TradeSide["session"]
  version: number
}>

/** 通信後の双方の状態と提示の版を照合し、古い読取りによる上書きを防ぐ。 */
export function getCurrentTradeOffer(props: Props): { mine: TradeSide; other: TradeSide } | null {
  const mine = props.sender.presence.trade
  const other = props.recipient.presence.trade
  if (props.sender.presence.closed || props.recipient.presence.closed || !mine?.open || !other?.open) return null
  if (mine.session !== props.session || other.session !== props.session || mine.with !== props.recipient.id || other.with !== props.sender.id) return null
  if (mine.offerVersion !== props.version || mine.locked || mine.settling || other.settling) return null

  return { mine, other }
}
