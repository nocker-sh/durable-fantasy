import { getFrontAccessHandlePlan } from "#/scripts/lib/get-front-access-handle-plan"
import { getRaisedCabinetLeafParts } from "#/world/town/get-raised-cabinet-leaf-parts"
import { getFrontAccessHandleLocalBar } from "#/scripts/lib/get-front-access-handle-local-bar"
import { getSingleBarGripPose } from "#/world/scene/figure/get-single-bar-grip-pose"
import { getFrontAccessHandleStandingPose } from "#/scripts/lib/get-front-access-handle-standing-pose"
type Props = Parameters<typeof getFrontAccessHandlePlan>[0] & Readonly<{ leaf: "north" | "south"; progress: number }>

/** Each static sample grips the whole real bar with one hand; changing the actor's standing place still needs footwork. */
export function getFrontAccessHandleFrame(props: Props) {
  const plan = getFrontAccessHandlePlan(props)
  if (plan instanceof Error) return plan
  if (!Number.isFinite(props.progress) || props.progress < 0 || props.progress > 1 || !["north", "south"].includes(props.leaf)) return new Error("Invalid raised-handle progress")
  const source = plan.source,
    standing = getFrontAccessHandleStandingPose({ source })
  if (standing instanceof Error) return standing
  const direction = { north: 1, south: -1 },
    parts = getRaisedCabinetLeafParts({ spec: plan.spec, handle: plan.handle, leaf: props.leaf, offset: direction[props.leaf] * plan.travel[props.leaf] * props.progress })
  const bridge = parts.bar,
    body: readonly [number, number] = [(bridge.x0 + bridge.x1) / 2 + source.body_from_bar_m[0], (bridge.z0 + bridge.z1) / 2 + source.body_from_bar_m[1]],
    skeleton = standing.skeleton,
    rootY = standing.rootY,
    look = standing.look
  const bar = getFrontAccessHandleLocalBar({ plan, rootY })
  if (bar instanceof Error) return bar
  const posed = getSingleBarGripPose({
    look,
    skeleton,
    hand: source.hand,
    target: [(bar.from[0] + bar.to[0]) / 2, (bar.from[1] + bar.to[1]) / 2, (bar.from[2] + bar.to[2]) / 2],
    pole: source.elbow_pole,
    bar,
  })
  if (posed instanceof Error) return posed
  const opposite = { north: plan.closed.south, south: plan.closed.north }

  return {
    look,
    native: standing.native,
    skeleton,
    posed: { ...posed, rootY },
    body,
    bar,
    parts,
    hand: source.hand,
    topObjects: plan.topObjects,
    solids: [...plan.fixed, ...plan.topObjects, parts.panel, ...parts.posts, ...opposite[props.leaf].all, ...plan.contents],
    section: plan.section,
  }
}
