import { doorAxes } from "#/scripts/lib/door-axes"
import { projectEnvelopeDoorPoint } from "#/scripts/lib/project-envelope-door-point"
import type { SpatialFrame } from "#/lib/engine/spatial-frame"
import type { DoorSwing } from "#/scripts/lib/door-swing"
import type { entryStepGeometry } from "#/scripts/lib/entry-step-geometry"

type Props = Readonly<{
  frame: SpatialFrame
  origin: readonly [number, number]
  cellM: number
  swing: DoorSwing
  entrance: NonNullable<ReturnType<typeof entryStepGeometry>>
  metresPerTile: number
}>

/** Reconcile the interior leaf with its outdoor doorway in the same rotated site frame. */
export function getEnvelopeDoorProjection(props: Props) {
  const swing = props.swing,
    entrance = props.entrance,
    closed = doorAxes(swing).closed
  const hinge = projectEnvelopeDoorPoint({ ...props, point: [swing.hinge[0], swing.hinge[1]] })
  const centre = projectEnvelopeDoorPoint({ ...props, point: [swing.hinge[0] + (closed[0] * swing.radius) / 2, swing.hinge[1] + (closed[1] * swing.radius) / 2] })
  const worldTangent = [-entrance.outward[1], entrance.outward[0]]
  const delta = entrance.upperPoint.map((value, index) => value - centre[index]),
    recess = delta[0] * entrance.outward[0] + delta[1] * entrance.outward[1]
  if (recess < 0 || Math.abs(delta[0] * worldTangent[0] + delta[1] * worldTangent[1]) > 1e-6) throw new Error("Exterior door does not align with its interior opening")
  const hingeSign = Math.sign((hinge[0] - centre[0]) * worldTangent[0] + (hinge[1] - centre[1]) * worldTangent[1])
  return { recess, hingeSign }
}
