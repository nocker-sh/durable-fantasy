import type { Ctx } from "#/world/server/map-room/context"

export type HeartbeatContext = Readonly<
  Pick<Ctx, "me" | "save"> & {
    key: Pick<Ctx["key"], "world" | "map">
    ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "state" | "send">; params: Ctx["ctx"]["params"] }>
  }
>
