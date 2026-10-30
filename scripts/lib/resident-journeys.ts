import type { SettingDocument } from "#/scripts/lib/setting-document"
import { outdoorEntrance } from "#/scripts/lib/outdoor-entrance"
import { auditOutdoorJourney } from "#/scripts/lib/audit-outdoor-journey"
import type { JourneyGround } from "#/scripts/lib/audit-outdoor-journey"
type Journey = {
  map: string
  activity: string
  from: { document: string; room: string; door: number[] }
  to_facility: string
  arrival: string
  width_m: number
  points_tiles: number[][]
  status: string
}
export type JourneyArrival = { facility: string; place: string; point: readonly [number, number]; width_m: number }
export type JourneyMap = { ground: JourneyGround; arrivals: ReadonlyMap<string, JourneyArrival> }
/** Bind physical journeys to the actual resident, home doorway and shared arrival definition. */
export function auditResidentJourneys(actor: SettingDocument, documents: ReadonlyMap<string, SettingDocument>, maps: ReadonlyMap<string, JourneyMap>): string[] {
  const errors: string[] = []
  for (const journey of (actor.outdoor_journeys ?? []) as Journey[]) {
    const fail = (problem: string) => errors.push(`${actor.id}/${journey.activity}: ${problem}`)
    const map = maps.get(journey.map),
      target = documents.get(journey.to_facility)
    const arrival = map?.arrivals.get(journey.arrival)
    if (actor.kind !== "residents" || !(documents.get(journey.from.document)?.residents as string[] | undefined)?.includes(actor.id) || !(target?.users as string[] | undefined)?.includes(actor.id))
      fail("Journey actor does not belong to its home or workplace")
    const source = map ? outdoorEntrance(journey.from, documents, map.ground.metres_per_tile) : undefined
    const site = target?.site as { map?: string; place?: string } | undefined
    if (
      !map ||
      !source ||
      !arrival ||
      arrival.point.length !== 2 ||
      arrival.point.some((n) => !Number.isFinite(n)) ||
      !Number.isFinite(arrival.width_m) ||
      arrival.width_m <= 0 ||
      source.map !== journey.map ||
      target?.kind !== "facilities" ||
      target.id !== arrival.facility ||
      site?.map !== journey.map ||
      site?.place !== arrival.place
    ) {
      fail("Journey endpoints have no matching home and arrival feature")
      continue
    }
    if (journey.points_tiles.length < 2 || journey.points_tiles.some((p) => p.length !== 2 || p.some((n) => !Number.isFinite(n)))) {
      fail("Invalid journey width or points")
      continue
    }
    const first = journey.points_tiles[0],
      last = journey.points_tiles.at(-1)!,
      next = journey.points_tiles[1]
    if (Math.hypot(first[0] - source.point[0], first[1] - source.point[1]) > 1e-6 || Math.hypot(last[0] - arrival.point[0], last[1] - arrival.point[1]) > 1e-6)
      fail("Journey does not join its exact home door and arrival feature")
    if ((next[0] - first[0]) * source.outward[0] + (next[1] - first[1]) * source.outward[1] <= 0) fail("Journey does not leave its doorway outward")
    if (journey.width_m > source.width_m + 1e-9) fail("Journey is wider than the home door")
    if (journey.width_m > arrival.width_m + 1e-9) fail("Journey is wider than the arrival stairs")
    for (const problem of auditOutdoorJourney({ points: journey.points_tiles, widthMetres: journey.width_m, ground: map.ground, sourceId: source.id })) fail(problem)
    if (actor.design_gate === "通過" && journey.status !== "designed") fail("Journey is still proposed")
  }
  return errors
}
