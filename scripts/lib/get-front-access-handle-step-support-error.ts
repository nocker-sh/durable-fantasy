import { getFrontAccessHandleStepFrame } from "#/scripts/lib/get-front-access-handle-step-frame"
import { getFrontAccessHandleStepContactError } from "#/scripts/lib/get-front-access-handle-step-contact-error"
type Props = Parameters<typeof getFrontAccessHandleStepFrame>[0] & Readonly<{ frame: Exclude<ReturnType<typeof getFrontAccessHandleStepFrame>, Error> }>

/** Anchor the support shoe in the authored phase, independently of the frame being checked; the full capsule must stay fixed. */
export function getFrontAccessHandleStepSupportError(props: Props): Error | null {
  const anchor = getFrontAccessHandleStepFrame({ ...props, phase: 0 })
  if (anchor instanceof Error) return anchor
  const support = { frame: anchor }
  if (props.phase > 0.5) {
    const middle = getFrontAccessHandleStepFrame({ ...props, phase: 0.5 })
    if (middle instanceof Error) return middle
    support.frame = middle
  }
  return getFrontAccessHandleStepContactError({ from: support.frame, to: props.frame, leaf: props.leaf, phase: props.phase })
}
