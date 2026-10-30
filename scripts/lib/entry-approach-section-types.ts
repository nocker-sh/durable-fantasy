import type { z } from "zod"
import type { entryApproachSectionSchema } from "#/scripts/lib/entry-approach-section-schema"
import type { entryApproachSchema } from "#/scripts/lib/entry-approach-schema"
import type { ScalarField } from "#/lib/engine/scalar-field"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Road } from "#/world/maps/layout-types"

export type EntryApproachPlan = z.infer<typeof entryApproachSchema> & { section: z.infer<typeof entryApproachSectionSchema> }
export type EntryApproachContext = Readonly<{ building: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; terrain: ScalarField; roads: readonly Road[]; metres: number }>
