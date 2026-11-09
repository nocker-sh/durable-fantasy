import type { Ctx } from "#/world/server/map-room/context"

export type MovementRequestContext = Readonly<
  Pick<Ctx, "me" | "save" | "standUp" | "receivedAt"> & {
    map: Pick<Ctx["map"], "size" | "rows">
    ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "id" | "send">; room: Pick<Ctx["ctx"]["room"], "broadcast"> }>
  }
>
