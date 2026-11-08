import { buildBody } from "#/world/scene/figure/body"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import type { NativeGroundPose, NativeGroundContact } from "#/world/scene/figure/native-ground-contact-types"
import type { Look } from "#/world/scene/figure/look"
type Props = { look: Look; pose: NativeGroundPose; heading: number; knee: "l" | "r" }

/** The same rendered shoe capsules and clothed knee supply named world contact points; grounding alone grants no balance or load support. */
export function getNativeGroundContacts(props: Props): readonly NativeGroundContact[] | Error {
  const pose = props.pose
  if (![...pose.body, pose.rootY, props.heading].every(Number.isFinite)) return new Error("Invalid native ground-contact transform")
  const body = buildBody(props.look, pose.skeleton, null),
    contacts: NativeGroundContact[] = []
  const world = (point: readonly [number, number, number]) => toHeadingWorldPoint(point, [pose.body[0], pose.rootY, pose.body[1]], props.heading)
  for (const side of ["l", "r"] satisfies ("l" | "r")[]) {
    const shoe = body.footwear[side],
      end = shoe.a[1] <= shoe.b[1] ? shoe.a : shoe.b
    contacts.push({ id: `shoe_${side}`, point: world([end[0], end[1] - shoe.r, end[2]]) })
  }
  const knee = body.knees[props.knee]
  if (!knee) return new Error("Native support has no clothed knee")
  contacts.push({ id: `knee_${props.knee}`, point: world([knee.c[0], knee.c[1] - knee.r, knee.c[2]]) })
  if (contacts.some((contact) => !contact.point.every(Number.isFinite) || Math.abs(contact.point[1]) > 1e-9)) return new Error("Native support does not stay on the room floor")

  return contacts
}
