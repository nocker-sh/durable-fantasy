import type { Ctx } from "#/world/server/map-room/context"

export type PartyChatContext = Readonly<Pick<Ctx, "me"> & { ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "state" | "send"> }> }>
