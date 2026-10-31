import type { Player } from "#/durable-objects/player"
import type { Ctx } from "#/world/server/map-room/context"

type Props = Readonly<{
  sender: Pick<Ctx["ctx"]["connection"], "send">
  recipient: Pick<Ctx["ctx"]["connection"], "send">
  playerA: Pick<ReturnType<typeof Player.get>, "read">
  playerB: Pick<ReturnType<typeof Player.get>, "read">
}>

/** 確定後に双方の状態を読み直す。通知失敗を理由に保存済みの取引を巻き戻さない。 */
export async function publishSettledTrade(props: Props): Promise<void> {
  const states = await Promise.all([props.playerA.read(), props.playerB.read()])
  await Promise.allSettled([
    props.sender.send({ type: "result", seq: -1, result: { ok: true, state: states[0], events: [] } }),
    props.recipient.send({ type: "result", seq: -1, result: { ok: true, state: states[1], events: [] } }),
  ])
}
