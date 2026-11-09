import type { Ctx } from "#/world/server/map-room/context"

type Connection = Pick<Ctx["ctx"]["connection"], "id" | "state" | "send" | "setState">

export type ThreadRequestContext = Readonly<
  Pick<Ctx, "me" | "save"> & { ctx: Readonly<{ connection: Pick<Connection, "id" | "send">; room: Readonly<{ getConnection(id: string): Connection | undefined }> }> }
>
