import { getFrontAccessHandlePlan } from "#/scripts/lib/get-front-access-handle-plan"
import { getFrontAccessHandleFrame } from "#/scripts/lib/get-front-access-handle-frame"
import { getFrontAccessHandleStepContext } from "#/scripts/lib/get-front-access-handle-step-context"
import { getHeadingLocalTranslationBounds } from "#/world/scene/get-heading-local-translation-bounds"
import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = Parameters<typeof getFrontAccessHandlePlan>[0] & Readonly<{ leaf: "north" | "south" }>

/** Keep swept fixed obstacles, the co-moving panel/posts and the contact bar distinct; only the certified palm may contact that bar. */
export function getFrontAccessHandleExternalObstacleContext(props: Props) {
  const plan = getFrontAccessHandlePlan(props),
    start = getFrontAccessHandleFrame({ ...props, progress: 0 }),
    end = getFrontAccessHandleFrame({ ...props, progress: 1 }),
    step = getFrontAccessHandleStepContext({ ...props, cycle: 0, phase: 0 })
  if (plan instanceof Error) return plan
  if (start instanceof Error) return start
  if (end instanceof Error) return end
  if (step instanceof Error) return step
  const fixedBoxes: Cuboid[] = [],
    movingBoxes: Cuboid[] = [],
    opposite = { north: plan.closed.south, south: plan.closed.north }
  for (const box of [...plan.section.obstacles, ...plan.fixed, ...plan.topObjects, ...opposite[props.leaf].all, ...plan.contents]) {
    const local = getHeadingLocalTranslationBounds({ box, from: [start.body[0], start.posed.rootY, start.body[1]], to: [end.body[0], end.posed.rootY, end.body[1]], heading: Math.PI / 2 })
    if (local instanceof Error) return local
    fixedBoxes.push(local)
  }
  for (const box of [start.parts.panel, ...start.parts.posts]) {
    const local = toHeadingLocalCuboid({ box, root: [start.body[0], start.posed.rootY, start.body[1]], heading: Math.PI / 2 })
    if (local instanceof Error) return local
    movingBoxes.push(local)
  }
  const contactBox = toHeadingLocalCuboid({ box: start.parts.bar, root: [start.body[0], start.posed.rootY, start.body[1]], heading: Math.PI / 2 })
  if (contactBox instanceof Error) return contactBox

  return { fixedBoxes, movingBoxes, contactBox, start, step, ceiling: plan.section.ceiling }
}
