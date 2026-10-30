import { doorHandleAlong } from "#/world/town/door-handle-along"
import type { DoorSwing } from "#/scripts/lib/door-swing"
import { doorAxes } from "#/scripts/lib/door-axes"
import { MIN_PASSAGE_WIDTH_M, MAX_HAND_REACH_M } from "#/scripts/lib/spatial-rules"
import type { DoorOperation } from "#/scripts/lib/door-operation"
import { operatorRectDistance } from "#/scripts/lib/operator-rect-distance"

type Props = {
  swing: DoorSwing
  operation: DoorOperation
  rows: string[]
  scale: number
}

export function auditDoorOperation(props: Props): string[] {
  if (props.operation.start_deg > props.operation.end_deg) return ["operator arc runs backward"]
  const errors: string[] = []
  if (props.operation.body_radius_m * 2 < MIN_PASSAGE_WIDTH_M) errors.push("operator body is smaller than the design width")
  if (props.operation.orbit_radius_m < Math.hypot(props.swing.radius, (props.swing.thickness_m ?? 0) / 2) + props.operation.body_radius_m) errors.push("operator body enters the leaf's swept area")
  const deviation = (Math.max(props.operation.start_deg, 90 - props.operation.end_deg) * Math.PI) / 180
  const grip = doorHandleAlong(props.swing.radius, props.swing.handle_along_m)
  const reach = Math.sqrt(props.operation.orbit_radius_m ** 2 + grip ** 2 - 2 * props.operation.orbit_radius_m * grip * Math.cos(deviation))
  if (reach > MAX_HAND_REACH_M + 1e-9) errors.push("handle is out of reach during operation")
  if (props.rows.length) {
    const inwardSource = doorAxes(props.swing),
      inward = inwardSource.inward,
      closed = inwardSource.closed
    const angles = [props.operation.start_deg, props.operation.end_deg, 0, 90].filter((angle) => angle >= props.operation.start_deg && angle <= props.operation.end_deg)
    const width = props.rows[0].length * props.scale,
      depth = props.rows.length * props.scale
    if (
      angles.some((degrees) => {
        const angle = (degrees * Math.PI) / 180
        const xState = props.swing.hinge.map((n, i) => n + props.operation.orbit_radius_m * (closed[i] * Math.cos(angle) + inward[i] * Math.sin(angle))),
          x = xState[0],
          y = xState[1]
        const body = props.operation.body_radius_m
        return x - body < -1e-9 || y - body < -1e-9 || x + body > width + 1e-9 || y + body > depth + 1e-9
      })
    )
      errors.push("operator body leaves the room footprint")
  }
  for (const y = { value: 0 }; y.value < props.rows.length; y.value++)
    for (const x = { value: 0 }; x.value < props.rows[y.value].length; x.value++)
      if (
        ![".", "D"].includes(props.rows[y.value][x.value]) &&
        operatorRectDistance(props.swing, props.operation, [x.value * props.scale, y.value * props.scale, props.scale, props.scale]) < props.operation.body_radius_m - 1e-9
      )
        errors.push(`operator path hits ${props.rows[y.value][x.value]}`)
  return [...new Set(errors)]
}
