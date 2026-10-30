import { z } from "zod"
import { entryApproachSchema } from "#/scripts/lib/entry-approach-schema"
import { getEntryStepPathErrors } from "#/scripts/lib/get-entry-step-path-errors"
import type { EntrySteps } from "#/scripts/lib/entry-steps-types"
import type { EntryStepGeometry } from "#/scripts/lib/entry-step-geometry-types"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ building: SettingDocument; steps: EntrySteps; geometry: EntryStepGeometry; metres: number }>
const siteSchema = z.object({ approaches: z.array(entryApproachSchema).optional() })
export function getEntryStepApproachErrors(props: Props): string[] {
  const site = siteSchema.safeParse(props.building.site_plan)
  if (!site.success) return ["Invalid exterior stair approach"]
  const approach = site.data.approaches?.find((route) => route.room === props.steps.room && route.door[0] === props.steps.door[0] && route.door[1] === props.steps.door[1])
  const lowerIndex = approach?.points_tiles.findIndex((point) => Math.hypot(point[0] - props.geometry.lowerPoint[0], point[1] - props.geometry.lowerPoint[1]) < 1e-6) ?? -1
  if (!approach || lowerIndex < 1) return ["Entry stair approach does not connect its lower landing"]
  const errors: string[] = []
  if (approach.width_m > props.steps.clear_width_m + 1e-9) errors.push("Entry stair approach is wider than its clear passage")
  return [...errors, ...getEntryStepPathErrors(approach.points_tiles.slice(0, lowerIndex + 1), props.geometry, props.metres)]
}
