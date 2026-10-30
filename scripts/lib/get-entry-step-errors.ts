import { entryStepGeometry } from "#/scripts/lib/entry-step-geometry"
import { getEntryStepDoorErrors } from "#/scripts/lib/get-entry-step-door-errors"
import { getEntryStepDimensionErrors } from "#/scripts/lib/get-entry-step-dimension-errors"
import { getEntryStepApproachErrors } from "#/scripts/lib/get-entry-step-approach-errors"
import { getEntryStepTerrainErrors } from "#/scripts/lib/get-entry-step-terrain-errors"
import type { EntrySteps, EntryStepsAudit } from "#/scripts/lib/entry-steps-types"
type Props = EntryStepsAudit & Readonly<{ steps: EntrySteps }>
export function getEntryStepErrors(props: Props): string[] {
  const geometry = entryStepGeometry(props)
  if (!geometry) return ["Entry stair has no matching foundation and exterior doorway"]
  return [
    ...getEntryStepDoorErrors(props.building, props.documents.get(props.steps.room), props.steps),
    ...getEntryStepDimensionErrors(props.steps, geometry),
    ...getEntryStepApproachErrors({ ...props, geometry }),
    ...getEntryStepTerrainErrors(geometry, props.terrain, props.metres),
  ]
}
