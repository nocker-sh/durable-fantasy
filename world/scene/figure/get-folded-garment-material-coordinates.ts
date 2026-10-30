import type { getEllipticalFrustumField } from "#/lib/graphics/ray/get-elliptical-frustum-field"
import type { Vector3Tuple as V3 } from "../../../lib/engine/vector3-types"
type Section = Exclude<ReturnType<typeof getEllipticalFrustumField>, Error>
type Props = { waist: Section; lap: Section; waistLength: number; lapLength: number }

/** Material coordinates follow the two fabric spans; their seam classification never serves as a collision bound. */
export function getFoldedGarmentMaterialCoordinates(props: Props) {
  const total = props.waistLength + props.lapLength

  return {
    progress: (point: V3) => {
      if (props.waist.value(point) <= props.lap.value(point)) return (props.lapLength + props.waistLength * props.waist.along(point)) / total
      return (props.lapLength * (1 - props.lap.along(point))) / total
    },
    radialValue: (point: V3) => {
      if (props.waist.value(point) <= props.lap.value(point)) return props.waist.radialValue(point)
      return props.lap.radialValue(point)
    },
  }
}
