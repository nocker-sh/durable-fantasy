import type { entryStepGeometry } from "#/scripts/lib/entry-step-geometry"
import type { z } from "zod"
import type { entryStepSiteSchema } from "#/scripts/lib/entry-step-site-schema"
import type { getEntryStepSite } from "#/scripts/lib/get-entry-step-site"
export type EntryStepSite = NonNullable<ReturnType<typeof getEntryStepSite>>
export type EntryStepSection = EntryStepSite & Readonly<{ length: number; width: number; rise: number }>
export type EntryStepRectangle = readonly [number, number, number, number]
export type EntryStepSiteInput = z.infer<typeof entryStepSiteSchema>
export type EntryStepGeometry = NonNullable<ReturnType<typeof entryStepGeometry>>
