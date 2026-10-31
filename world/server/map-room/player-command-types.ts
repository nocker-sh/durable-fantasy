import type { Ctx } from "#/world/server/map-room/context"

export type PlayerCommandContext = Readonly<
  Pick<Ctx, "me" | "save"> & {
    map: Pick<Ctx["map"], "id">
    ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "id" | "send">; room: Pick<Ctx["ctx"]["room"], "broadcast"> }>
  }
>
