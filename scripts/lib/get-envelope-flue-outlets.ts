import { z } from "zod"
const outletsSchema = z.array(z.object({ outlet_above_ridge_m: z.number().positive() }))

export function getEnvelopeFlueOutlets(value: unknown, expectedCount: number) {
  const parsed = outletsSchema.safeParse(value ?? [])
  if (!parsed.success || parsed.data.length !== expectedCount) throw new Error("Flue outlet height is missing")
  return parsed.data
}
