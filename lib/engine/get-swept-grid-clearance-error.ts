import { getSweptGridClearanceFailure } from "#/lib/engine/get-swept-grid-clearance-failure"
type Props = Parameters<typeof getSweptGridClearanceFailure>[0]

/** Preserve the diagnostic Error contract while sharing the exact footprint proof with ordinary candidate rejection. */
export function getSweptGridClearanceError(props: Props): Error | null {
  const failure = getSweptGridClearanceFailure(props)
  if (failure !== null) return new Error(failure)

  return null
}
