import { getPouringPotNativePoint } from "#/world/scene/figure/get-pouring-pot-native-point"
import { getEllipticalFrustumField } from "#/lib/graphics/ray/get-elliptical-frustum-field"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import type { getPouringPotNativeParts } from "#/world/scene/figure/get-pouring-pot-native-parts"
import type { BoundedField } from "#/lib/engine/field-separation"
type Props = Parameters<typeof getPouringPotNativeParts>[0]

/** Two filled outer frusta enclose every body/lip triangle; refinements never let an arm hide inside the hollow pot. */
export function getPouringPotBodyFields(props: Props): readonly BoundedField[] | Error {
  const p = props.profile.dimensions,
    levels = [0, p.lipStart, p.height],
    fields: BoundedField[] = []
  const point = (height: number) => getPouringPotNativePoint({ ...props, point: [0, height, 0] }),
    origin = point(0),
    across = getPouringPotNativePoint({ ...props, point: [1, 0, 0] }),
    acrossHint = sub([...across], [...origin])
  const radius = (height: number) => p.baseDiameter / 2 + ((p.diameter - p.baseDiameter) * height) / (2 * p.height) + p.lipLength * Math.max(0, (height - p.lipStart) / (p.height - p.lipStart))
  for (const index of [0, 1]) {
    const field = getEllipticalFrustumField({
      from: [...point(levels[index])],
      to: [...point(levels[index + 1])],
      acrossHint,
      radiusFrom: radius(levels[index]),
      radiusTo: radius(levels[index + 1]),
      compression: 1,
      shellThickness: null,
    })
    if (field instanceof Error) return field
    fields.push(field)
  }

  return fields
}
