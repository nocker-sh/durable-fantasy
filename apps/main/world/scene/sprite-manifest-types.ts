import type { z } from "zod"
import type { spriteManifestSchema } from "#/world/scene/sprite-manifest-schema"
export type SpriteManifest = z.infer<typeof spriteManifestSchema>
