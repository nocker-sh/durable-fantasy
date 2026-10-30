import type { z } from "zod"
import type { foundationSchema } from "#/scripts/lib/foundation-schema"
export type Foundation = z.infer<typeof foundationSchema>
