import { z } from "zod"
import { entryStepsSchema } from "#/scripts/lib/entry-steps-schema"
import { entryStepGeometry } from "#/scripts/lib/entry-step-geometry"
import type { EntryApproachContext, EntryApproachPlan } from "#/scripts/lib/entry-approach-section-types"

const stairsSchema = z.array(entryStepsSchema)
type Props = EntryApproachContext & Readonly<{ approach: EntryApproachPlan }>

/** Bind the height plan to its existing lower landing; a duplicated coordinate must not silently drift. */
export function getEntryApproachSurfaceSource(props: Props) {
  const stairs = stairsSchema.safeParse(props.building.entry_steps)
  if (!stairs.success) return new Error("Entry surface has no designed exterior stairs")
  const approach = props.approach
  const steps = stairs.data.find((entry) => entry.room === approach.room && entry.door.every((coordinate, axis) => coordinate === approach.door[axis]))
  if (!steps) return new Error("Entry surface has no matching exterior stair")
  const geometry = entryStepGeometry({ building: props.building, documents: props.documents, steps, metres: props.metres })
  if (!geometry) return new Error("Entry surface has no dimensioned lower landing")
  const index = approach.points_tiles.findIndex((point) => point.every((coordinate, axis) => Math.abs(coordinate - geometry.lowerPoint[axis]) < 1e-6))
  if (index < 1 || approach.width_m > steps.clear_width_m + 1e-9) return new Error("Entry surface does not fit its lower landing")

  return { points: approach.points_tiles.slice(index), elevationM: steps.lower_elevation_m }
}
