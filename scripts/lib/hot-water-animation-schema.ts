import { z } from "zod"

export const hotWaterAnimationSchema = z.enum(["idle", "look"])
