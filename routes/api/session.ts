import { z } from "zod"
import { defineHandler } from "void"
import { playerId } from "#/world/core/identity.ts"
import { establishSession } from "#/world/server/session.ts"

export const POST = defineHandler.withValidator({
  body: z.object({
    legacyId: playerId.optional(),
    proof: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
  }),
})((context, { body }) => establishSession(context.req.raw, body.legacyId, body.proof))
