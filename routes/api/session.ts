import { z } from "zod"
import { defineHandler } from "void"
import { playerId } from "#/world/core/identity"
import { establishSession } from "#/world/server/establish-session"

const handler = defineHandler.withValidator({
  body: z.object({
    legacyId: playerId.optional(),
    proof: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
  }),
})

export const POST = handler((context, input) => establishSession(context.req.raw, input.body.legacyId, input.body.proof))
