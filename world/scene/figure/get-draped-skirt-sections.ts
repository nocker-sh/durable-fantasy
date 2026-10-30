import { getEllipticalFrustumField } from "#/lib/graphics/ray/get-elliptical-frustum-field"
import { lerpVector3 as lerp3 } from "../../../lib/engine/lerp-vector3"
import type { getDrapedSkirtProfile } from "#/world/scene/figure/get-draped-skirt-profile"
import type { Vector3Tuple as V3 } from "../../../lib/engine/vector3-types"
type Profile = Exclude<ReturnType<typeof getDrapedSkirtProfile>, Error>
type Section = Exclude<ReturnType<typeof getEllipticalFrustumField>, Error> & { distance: number; length: number }
type Props = { profile: Profile; supportDepth: number; shellThickness: number | null }

/** Clip the frill to its hem band; compress lap and drop across their respective thickness axes. */
export function getDrapedSkirtSections(props: Props): readonly Section[] | Error {
  const profile = props.profile,
    sections: Section[] = []
  for (const index of [0, 1, 2]) {
    const from = Math.max(profile.start, profile.distances[index]),
      to = profile.distances[index + 1],
      length = to - from
    if (length <= 0) continue
    const span = to - profile.distances[index],
      start = lerp3(profile.points[index], profile.points[index + 1], (from - profile.distances[index]) / span)
    const radiusAt = (distance: number) => profile.waistRadius + ((profile.radius - profile.waistRadius) * (distance - profile.start)) / (profile.total - profile.start)
    const radiusFrom = radiusAt(from),
      radiusTo = radiusAt(to)
    const field = getEllipticalFrustumField({
      from: start,
      to: profile.points[index + 1],
      acrossHint: [1, 0, 0] satisfies V3,
      radiusFrom,
      radiusTo,
      compression: index === 0 ? 1 : props.supportDepth / Math.max(radiusFrom, radiusTo),
      shellThickness: props.shellThickness,
    })
    if (field instanceof Error) return field
    sections.push({ ...field, distance: from, length })
  }

  return sections.length ? sections : new Error("Empty draped skirt")
}
