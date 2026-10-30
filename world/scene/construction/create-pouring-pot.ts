import * as THREE from "three"
import { createPouringPotBody } from "#/world/scene/construction/create-pouring-pot-body"
import { createPouringPotHandle } from "#/world/scene/construction/create-pouring-pot-handle"
import { createPouringPotLid } from "#/world/scene/construction/create-pouring-pot-lid"
import type { getPouringPotProfile } from "#/world/town/get-pouring-pot-profile"
import type { Point3 } from "../../../lib/engine/cuboid-motion-types"
type Props = { profile: Exclude<ReturnType<typeof getPouringPotProfile>, Error>; at: Point3; heading: number; lid: "seated" | "absent" }

/** Use one measured vessel in heating, cooling and storage; a parked lid is never also drawn on this pot. */
export function createPouringPot(props: Props): THREE.Group | Error {
  const body = createPouringPotBody(props.profile)
  if (body instanceof Error) return body
  const root = new THREE.Group()
  root.name = "pouring-pot"
  root.add(body)
  for (const section of props.profile.handle) {
    const handle = createPouringPotHandle(section)
    if (handle instanceof Error) {
      root.traverse((part) => {
        if (part instanceof THREE.Mesh) part.geometry.dispose()
      })
      return handle
    }
    root.add(handle)
  }
  if (props.lid === "seated") {
    const lid = createPouringPotLid(props.profile)
    lid.position.y = props.profile.dimensions.height
    root.add(lid)
  }
  root.position.set(...props.at)
  root.rotation.y = props.heading

  return root
}
