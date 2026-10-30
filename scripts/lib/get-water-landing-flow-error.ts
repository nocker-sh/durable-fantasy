import { getSweptGridClearanceError } from "#/lib/engine/get-swept-grid-clearance-error"
import { MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"
import type { WaterLanding } from "#/scripts/lib/water-landing-schema"

/** One waiting household advances to the service place, then leaves without crossing the next waiting place. */
export function getWaterLandingFlowError(landing: WaterLanding): Error | null {
  const waiting = landing.zones.find((zone) => zone.role === "waiting"),
    service = landing.zones.find((zone) => zone.role === "collection"),
    departure = landing.zones.find((zone) => zone.role === "departure")
  if (!waiting || !service || !departure) return new Error("Water landing flow has no distinct stages")
  const centre = (zone: typeof waiting): [number, number] => [(zone.rect[0] + zone.rect[2] / 2) * landing.cell_m, (zone.rect[1] + zone.rect[3] / 2) * landing.cell_m]
  for (const stage of [
    { from: waiting, to: service, excluded: departure.symbol },
    { from: service, to: departure, excluded: waiting.symbol },
  ]) {
    const error = getSweptGridClearanceError({
      from: centre(stage.from),
      to: centre(stage.to),
      radius: MIN_PASSAGE_WIDTH_M / 2,
      cellSize: landing.cell_m,
      isCellFree: (cell) => {
        const symbol = landing.rows[cell[1]]?.[cell[0]]
        return symbol !== undefined && symbol !== stage.excluded
      },
    })
    if (error) return new Error("Water landing flow crosses another stage or leaves its floor", { cause: error })
  }

  return null
}
