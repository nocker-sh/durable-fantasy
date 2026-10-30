import { z } from "zod"
const referenceList = z.array(z.string().trim().min(1)).min(1)

export const townSupplySystemsSchema = z
  .array(
    z.object({
      id: z.string().trim().min(1),
      resource: z.string().trim().min(1),
      sources: referenceList.optional(),
      processing: referenceList.optional(),
      destinations: referenceList.optional(),
      carriers: referenceList.optional(),
      handlers: referenceList.optional(),
      unresolved: z.array(z.string().trim().min(1)),
    }),
  )
  .min(1)
