import { getPouringPotStations } from "#/world/town/get-pouring-pot-stations"
import { getPouringPotStationError } from "#/world/town/get-pouring-pot-station-error"
import type { PouringPotLayoutInput } from "#/world/town/pouring-pot-layout-types"

/** Both temporary uses share one masonry-supported rest area, never simultaneously. */
export function getPouringPotLayout(props: PouringPotLayoutInput) {
  const stations = getPouringPotStations(props)
  if (stations instanceof Error) return stations
  const error = getPouringPotStationError({ input: props, stations })
  if (error) return error
  return stations
}
