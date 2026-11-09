import { appendPrimitives } from "#/lib/graphics/ray/append-primitives"
import type { Primitive } from "#/lib/graphics/ray/primitive-types"
import { buildBody } from "#/world/scene/figure/body"
import { getHorizontalBounds } from "#/lib/graphics/ray/get-horizontal-bounds"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
type Props = {
  look: Look
  skeleton: Skel
  position: readonly [number, number]
  heading: number
  scale: number
  area: readonly [number, number, number, number]
  extraPrimitives?: readonly Omit<Primitive, "id">[]
}

/** Enclose every rendered native body part on the horizontal floor; foot contact and carried objects are separate reviews. */
export function getStandingFootprintError(props: Props): Error | null {
  if (![...props.position, props.heading, props.scale, ...props.area].every(Number.isFinite) || props.scale <= 0 || props.area[0] >= props.area[2] || props.area[1] >= props.area[3])
    return new Error("Invalid standing footprint transform or floor")
  const body = buildBody(props.look, props.skeleton, null)
  if (!body.prims.length) return new Error("Standing body has no rendered parts")
  const primitives = appendPrimitives(body.prims, props.extraPrimitives ?? [])
  if (primitives instanceof Error) return primitives
  const bounds = getHorizontalBounds({ primitives, position: props.position, heading: props.heading, scale: props.scale })
  if (bounds instanceof Error) return bounds
  if (bounds[0] < props.area[0] || bounds[1] < props.area[1] || bounds[2] > props.area[2] || bounds[3] > props.area[3])
    return new Error("Standing body leaves its assigned floor", { cause: { bounds } })

  return null
}
