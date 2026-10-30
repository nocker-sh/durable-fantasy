import { getCarrierTranslationError } from "#/world/scene/figure/get-carrier-translation-error"
type Props = Omit<Parameters<typeof getCarrierTranslationError>[0], "destination">
/** A stationary check uses the same complete body envelope as the continuous translation. */
export function getCarrierRoomClearanceError(props: Props): Error | null {
  return getCarrierTranslationError({ ...props, destination: props.body })
}
