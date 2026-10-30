import { getDrapedSkirtProfile } from "#/world/scene/figure/get-draped-skirt-profile"
import { getDrapedSkirtSections } from "#/world/scene/figure/get-draped-skirt-sections"
import { getUnionFieldPrimitive } from "#/lib/graphics/ray/get-union-field-primitive"
import { seatedSupportDepth } from "#/world/scene/figure/seated-support-depth"
import type { BodyContext } from "#/world/scene/figure/context"
import type { SkirtLayer } from "#/world/scene/figure/get-draped-skirt-profile"
import type { Vector3Tuple as V3 } from "../../../lib/engine/vector3-types"

/** Geometry and colour follow the same cloth path; its material classification is not a separation bound. */
export function getDrapedSkirtGeometry(context: BodyContext, layer: SkirtLayer) {
  const profile = getDrapedSkirtProfile(context, layer)
  if (profile instanceof Error) return profile
  const sections = getDrapedSkirtSections({ profile, supportDepth: seatedSupportDepth(context.L), shellThickness: layer === "overskirt" ? 0.01 * context.S : null })
  if (sections instanceof Error) return sections
  const shape = getUnionFieldPrimitive(sections)
  if (shape instanceof Error) return shape
  const sectionAt = (point: V3) => sections.reduce((best, section) => (section.value(point) < best.value(point) ? section : best))

  return {
    shape: { ...shape, boxBounds: () => sections.map((section) => ({ min: section.min, max: section.max })) },
    profile,
    progress: (point: V3) => {
      const section = sectionAt(point)
      return 1 - (section.distance + section.along(point) * section.length) / profile.total
    },
    radialValue: (point: V3) => sectionAt(point).radialValue(point),
  }
}
