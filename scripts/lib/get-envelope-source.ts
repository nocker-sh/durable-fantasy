import { envelopeSourceSchema } from "#/scripts/lib/envelope-source-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Validate only the exterior's inputs without rewriting the authored document or its additional metadata. */
export function getEnvelopeSource(building: SettingDocument) {
  const parsed = envelopeSourceSchema.safeParse(building)
  if (!parsed.success) throw new Error("Exterior needs a valid site, foundation, roof and one entrance stair")
  return parsed.data
}
