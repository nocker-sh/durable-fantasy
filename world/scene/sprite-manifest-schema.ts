import { z } from "zod"
const count = z.number().int().positive()
const resident = z.object({ name: z.string().min(1), key: z.string().min(1), anims: z.record(z.string(), count).readonly() }).readonly()

export const spriteManifestSchema = z.object({ rendererVersion: count.optional(), frame: z.tuple([count, count]).readonly(), residents: z.array(resident).readonly() }).readonly()
