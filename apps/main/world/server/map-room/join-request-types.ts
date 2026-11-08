import type { Ctx } from "#/world/server/map-room/context"

export type MapAdmissionProgress = { counted: boolean; admitted: boolean }

type Connection = Pick<Ctx["ctx"]["connection"], "id" | "state" | "send" | "close">
export type JoinRequestContext = Readonly<
  Pick<Ctx, "me" | "save" | "key"> & {
    map: Pick<Ctx["map"], "size" | "rows" | "spawn">
    ctx: Readonly<{
      connection: Pick<Connection, "id" | "state" | "send">
      params: Ctx["ctx"]["params"]
      room: Pick<Ctx["ctx"]["room"], "broadcast"> & { getConnections(): Iterable<Connection> }
    }>
  }
>
