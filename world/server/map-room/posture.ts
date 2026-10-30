// Confirm standing before movement or combat; connection state follows the saved player state.
import { Player } from "../../../durable-objects/player"
import type { Ctx } from "./context"
import { notifyClient } from "./notifications"

export async function standUp(inputProps: Pick<Ctx, "ctx" | "me" | "save">): Promise<boolean> {
  const ctx = inputProps.ctx
  const me = inputProps.me
  const save = inputProps.save

  if (!me.sitting) return true
  if (!me.owner) return false
  const result = await Player.get(me.owner).run({ type: "stand" })
  if (result.ok) save({ sitting: result.state.sitting })
  await notifyClient(ctx.connection.send({ type: "result", seq: -1, result }))
  return result.ok
}
