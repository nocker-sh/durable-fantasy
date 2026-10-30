import { buildBody } from "#/world/scene/figure/body"
import { getSeatedNativePose } from "#/world/scene/get-seated-native-pose"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
type Props = Parameters<typeof getSeatedNativePose>[0]

/** Keep physical checks aligned with the native sitting clip and its actual footwear and clothed knees. */
export function getSeatedContacts(props: Props) {
  const pose = getSeatedNativePose(props)
  if (pose instanceof Error) return pose
  const body = buildBody(props.look, pose.skeleton, null)
  const shoes = Object.values(body.footwear).map((shoe) => ({
    a: toHeadingWorldPoint(shoe.a, pose.root, props.place.heading),
    b: toHeadingWorldPoint(shoe.b, pose.root, props.place.heading),
    radius: shoe.r,
  }))
  const knees = Object.values(body.knees).flatMap((knee) => {
    if (!knee) return []
    return [{ center: toHeadingWorldPoint(knee.c, pose.root, props.place.heading), radius: knee.r }]
  })

  return { shoes, knees }
}
