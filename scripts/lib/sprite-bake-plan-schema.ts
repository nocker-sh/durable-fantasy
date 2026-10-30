import { z } from "zod"
import { spriteManifestSchema } from "#/world/scene/sprite-manifest-schema"

const versionedManifest = spriteManifestSchema.unwrap().extend({ rendererVersion: z.number().int().positive() }).readonly()

export const spriteBakePlanSchema = z
  .object({ format: z.literal(1), scope: z.enum(["all", "selected"]), source: versionedManifest, output: versionedManifest, selected: z.array(z.number().int().nonnegative()).min(1).readonly() })
  .readonly()
