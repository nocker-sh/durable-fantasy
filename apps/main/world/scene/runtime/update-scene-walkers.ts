import type { MotionWalker } from "#/world/scene/runtime/walker-motion-types"
import type { WalkerMotion } from "#/world/scene/runtime/walker-motion"
import type { SceneFrame } from "#/world/scene/runtime/scene-frame-types"

type Props = Readonly<{
  me: MotionWalker
  remotes: ReadonlyMap<string, MotionWalker>
  preview: boolean
  frame: Pick<SceneFrame, "dt" | "elapsed">
  step: WalkerMotion["step"]
  place: WalkerMotion["place"]
  stepHeld(): void
  arrive(): void
}>

/** Arrival and newly held paths happen after elapsed movement, before placing any walker. */
export function updateSceneWalkers(props: Props): void {
  if (!props.preview) props.stepHeld()
  const wasWalking = props.me.path.length > 0
  props.step(props.me, props.frame.dt, props.frame.elapsed)
  if (wasWalking && !props.me.path.length) props.arrive()
  props.stepHeld()
  props.place(props.me)
  for (const walker of props.remotes.values()) {
    props.step(walker, props.frame.dt, props.frame.elapsed)
    props.place(walker)
  }
}
