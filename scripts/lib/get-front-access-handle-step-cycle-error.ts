import { getFrontAccessHandleStepFrame } from "#/scripts/lib/get-front-access-handle-step-frame"
import { getFrontAccessHandleStepContext } from "#/scripts/lib/get-front-access-handle-step-context"
import { getFrontAccessHandleStepContactError } from "#/scripts/lib/get-front-access-handle-step-contact-error"
import { getFrontAccessHandleFrameError } from "#/scripts/lib/get-front-access-handle-frame-error"
import { getNativeFootClearanceError } from "#/world/scene/figure/get-native-foot-clearance-error"
type Props = Omit<Parameters<typeof getFrontAccessHandleStepFrame>[0], "phase"> & Readonly<{ samples: number }>

/** Keep independent support anchors only for this cycle; every authored sample still receives all clearance checks. */
export function getFrontAccessHandleStepCycleError(props: Props): Error | null {
  if (!Number.isSafeInteger(props.samples) || props.samples < 2 || props.samples > 128) return new Error("Invalid raised-handle step sampling")
  const anchors = new Map<number, ReturnType<typeof getFrontAccessHandleStepFrame>>()
  for (const sample of Array.from({ length: props.samples + 1 }).keys()) {
    const phase = sample / props.samples,
      frame = getFrontAccessHandleStepFrame({ ...props, phase })
    const context = getFrontAccessHandleStepContext({ ...props, phase })
    if (frame instanceof Error) return frame
    if (context instanceof Error) return context
    const ground = getNativeFootClearanceError({ look: frame.look, skeleton: frame.posed.skeleton, rootY: frame.posed.rootY, offsets: context.offsets })
    if (ground) return ground
    const anchorPhase = phase > 0.5 ? 0.5 : 0
    if (!anchors.has(anchorPhase)) anchors.set(anchorPhase, getFrontAccessHandleStepFrame({ ...props, phase: anchorPhase }))
    const anchor = anchors.get(anchorPhase)
    if (!anchor) return new Error("Missing authored support anchor")
    if (anchor instanceof Error) return anchor
    const error = getFrontAccessHandleStepContactError({ from: anchor, to: frame, leaf: props.leaf, phase }) ?? getFrontAccessHandleFrameError({ frame })
    if (error) return error
  }
  return null
}
