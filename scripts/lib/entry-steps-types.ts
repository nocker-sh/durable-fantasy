import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { ScalarField } from "#/lib/engine/scalar-field"
import type { z } from "zod"
import type { entryStepsSchema } from "#/scripts/lib/entry-steps-schema"
export type EntrySteps = z.infer<typeof entryStepsSchema>
export type EntryStepsAudit = Readonly<{ building: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; terrain: ScalarField; metres: number }>
