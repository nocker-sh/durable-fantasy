import { getPersonalBoxIntervalContext } from "#/scripts/lib/get-personal-box-interval-context"
import { getPersonalBoxIntervalSliceError } from "#/scripts/lib/get-personal-box-interval-slice-error"
import { certifyLinearInterval } from "#/lib/engine/certify-linear-interval"
type Props = Parameters<typeof getPersonalBoxIntervalContext>[0]

/** Accept only a complete chain of proven vertical slices; gaps or a precision limit reject the entire candidate. */
export function getPersonalBoxContinuousReview(props: Props) {
  const context = getPersonalBoxIntervalContext(props)
  if (context instanceof Error) return context

  return certifyLinearInterval({ from: [0, 0, 0], to: [1, 0, 0], canClear: (from, to) => getPersonalBoxIntervalSliceError({ context, from: from[0], to: to[0] }) === null })
}
