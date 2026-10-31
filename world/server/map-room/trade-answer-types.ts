import type { Ctx } from "#/world/server/map-room/context"
import type { Cell } from "#/world/protocol"

export type TradeAnswerConnection = Pick<Ctx["ctx"]["connection"], "id" | "state" | "send" | "setState">
export type TradeAnswerContext = Readonly<
  Pick<Ctx, "me" | "save"> & {
    ctx: Readonly<{ connection: Pick<TradeAnswerConnection, "id" | "state" | "send">; room: { getConnection(id: string): TradeAnswerConnection | undefined } }>
  }
>
export type TradeAnswerDecision = { ok: true; recipientAt: Cell; askerAt: Cell } | { ok: false; reason: "DECLINED" | "BUSY" | "TOO_FAR" }
