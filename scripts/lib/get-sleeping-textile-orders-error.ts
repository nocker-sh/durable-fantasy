import { getSleepingTextileCuttings } from "#/scripts/lib/get-sleeping-textile-cuttings"
import { getTextileCuttingOrdersError } from "#/scripts/lib/get-textile-cutting-orders-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ room: SettingDocument; documents: ReadonlyMap<string, SettingDocument> }>

/** A complete blanket chain cannot stand in for a separate pillow-cover allocation. */
export function getSleepingTextileOrdersError(props: Props): Error | null {
  const cuttings = getSleepingTextileCuttings(props.room)
  if (cuttings instanceof Error) return cuttings

  for (const cutting of cuttings) {
    const error = getTextileCuttingOrdersError({ room: props.room, cutting, documents: props.documents })
    if (error) return error
  }

  return null
}
