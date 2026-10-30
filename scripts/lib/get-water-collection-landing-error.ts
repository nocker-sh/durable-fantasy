import { getWaterLandingBodyError } from "#/scripts/lib/get-water-landing-body-error"
import { potableWaterCollectionSchema } from "#/scripts/lib/potable-water-supply-schema"
import { getWaterLandingGridError } from "#/scripts/lib/get-water-landing-grid-error"
import { getWaterLandingFlowError } from "#/scripts/lib/get-water-landing-flow-error"
import { getWaterLandingGroundError } from "#/scripts/lib/get-water-landing-ground-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { MapDefinition } from "#/world/maps/types"
type Props = { document: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; map: MapDefinition; anchorTiles: readonly [number, number]; metresPerTile: number }

/** Receiving and queue checks do not certify drawing the bucket, the full plaza or household journeys. */
export function getWaterCollectionLandingError(props: Props): Error | null {
  const collection = potableWaterCollectionSchema.safeParse(props.document.water_collection)
  if (!collection.success) return new Error("Invalid water collection proposal")
  if (!collection.data.landing) return null
  const landing = collection.data.landing

  return (
    getWaterLandingGridError(landing) ??
    getWaterLandingFlowError(landing) ??
    getWaterLandingGroundError({ ...props, landing }) ??
    (landing.body_review ? getWaterLandingBodyError({ ...props, landing }) : null)
  )
}
