import { getCertifiedBarBodyError } from "#/world/scene/figure/get-certified-bar-body-error"
import { limbSd } from "#/lib/graphics/ray/limb-sd"
import { canSeparateSurfaceFromPrimitive } from "#/lib/graphics/ray/can-separate-surface-from-primitive"
import type { buildBody } from "#/world/scene/figure/body"
import type { getPouringPotNativeParts } from "#/world/scene/figure/get-pouring-pot-native-parts"
import type { Skel } from "#/world/scene/rig"
type Props = { body: ReturnType<typeof buildBody>; skeleton: Skel; bodyScale: number; bar: Exclude<ReturnType<typeof getPouringPotNativeParts>, Error>["bars"][number] }

/** Only the certified wooden sleeve and enclosed iron core may touch palms; their upper arms and every other body part still require clearance. */
export function getPouringPotBarBodyError(props: Props): Error | null {
  const bar = props.bar,
    contact = bar.part === "grip" || bar.part === "bridge",
    surface = limbSd([[...bar.from], [...bar.to]], [bar.radius, bar.radius])
  if (contact) return getCertifiedBarBodyError(props)
  for (const primitive of props.body.prims) {
    if (!canSeparateSurfaceFromPrimitive({ surface, primitive, margin: 0 })) return new Error(`Pouring pot ${bar.part} body clearance remains unresolved`, { cause: { primitive: primitive.id } })
  }

  return null
}
