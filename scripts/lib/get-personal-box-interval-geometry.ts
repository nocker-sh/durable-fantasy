import { getPersonalBoxMotionFrame } from "#/scripts/lib/get-personal-box-motion-frame"
import { getStorageLidBridge } from "#/world/town/get-storage-lid-bridge"
import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
import { buildBody } from "#/world/scene/figure/body"
import type { getPersonalBoxIntervalContext } from "#/scripts/lib/get-personal-box-interval-context"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = { context: Exclude<ReturnType<typeof getPersonalBoxIntervalContext>, Error>; from: number; to: number }

/** A midpoint plus certified displacement bounds encloses the complete slice, using uncut skin instead of a frozen palm hole. */
export function getPersonalBoxIntervalGeometry(props: Props) {
  if (![props.from, props.to].every(Number.isFinite) || props.from < 0 || props.to > 1 || props.from > props.to) return new Error("Invalid personal box interval slice")
  const context = props.context,
    frame = getPersonalBoxMotionFrame({ ...context.props, progress: (props.from + props.to) / 2 })
  if (frame instanceof Error) return frame
  const half = (props.to - props.from) / 2,
    bridge = getStorageLidBridge(frame.parts),
    moving: Cuboid[] = []
  if (!bridge) return new Error("Personal box interval has no unique bridge")
  for (const part of frame.parts.filter((part) => part !== bridge && (part.part === "lid" || part.part === "lid-handle"))) {
    const box = toHeadingLocalCuboid({
      box: { x0: part.x0, x1: part.x1, bottom: part.y0, top: part.y1, z0: part.z0, z1: part.z1 },
      root: [frame.body[0], frame.posed.rootY, frame.body[1]],
      heading: Math.PI / 2,
    })
    if (box instanceof Error) return box
    moving.push(box)
  }

  return {
    frame,
    body: buildBody(frame.look, frame.posed.skeleton, null),
    moving,
    margins: { l: context.bounds.l.surface * half + 1e-10, r: context.bounds.r.surface * half + 1e-10 },
    elbowMargins: { l: context.bounds.l.elbow * half + 1e-10, r: context.bounds.r.elbow * half + 1e-10 },
    barMargin: context.lidSpeed * half + 1e-10,
  }
}
