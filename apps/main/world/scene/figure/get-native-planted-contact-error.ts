import { getNativeGroundContacts } from "#/world/scene/figure/get-native-ground-contacts"
import { getNativePlantedFootwearError } from "#/world/scene/figure/get-native-planted-footwear-error"
import type { NativeGroundPose } from "#/world/scene/figure/native-ground-contact-types"
import type { Look } from "#/world/scene/figure/look"
type Props = { look: Look; from: NativeGroundPose; to: NativeGroundPose; heading: number; knee: "l" | "r" }

/** A planted phase preserves the same shoe and knee contact points; translating a grounded actor is still sliding. */
export function getNativePlantedContactError(props: Props): Error | null {
  const from = getNativeGroundContacts({ ...props, pose: props.from }),
    to = getNativeGroundContacts({ ...props, pose: props.to })
  if (from instanceof Error) return from
  if (to instanceof Error) return to
  for (const contact of from) {
    const target = to.find((other) => other.id === contact.id)
    if (!target || Math.hypot(...contact.point.map((value, axis) => value - target.point[axis])) > 1e-9) return new Error("Native planted support slides; a stepping design is required")
  }

  return getNativePlantedFootwearError({ ...props, sides: ["l", "r"] })
}
