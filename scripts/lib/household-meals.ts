import type { householdMealSchema } from "#/scripts/lib/household-meal-schema"
import type { z } from "zod"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { crowdedSeatCentres } from "#/scripts/lib/spatial-rules"
type Meal = z.infer<typeof householdMealSchema>
/** A household's dining plan assigns a physical seat to every member, without using an employee's home. */
export function auditHouseholdMeals(documents: ReadonlyMap<string, SettingDocument>): string[] {
  const errors: string[] = []
  for (const building of documents.values()) {
    if (building.kind !== "buildings" || building.design_gate !== "通過" || !(building.residents as string[] | undefined)?.length) continue
    const rooms = (building.rooms ?? []) as string[]
    if (
      !rooms.some((id) => {
        const room = documents.get(id)
        return room?.kind === "rooms" && room.building === building.id && !!room.household_meal
      })
    )
      errors.push(`${building.id}: completed household has no dining plan`)
  }
  for (const room of documents.values()) {
    const meal = room.household_meal as Meal | undefined
    if (!meal) continue
    const building = documents.get(String(room.building)),
      members = (building?.residents ?? []) as string[],
      seats = meal.seats,
      table = room.furniture?.find((f) => f.symbol === meal.table)
    const fail = (message: string) => errors.push(`${room.id}: ${message}`)
    if (room.kind !== "rooms" || !room.grid || building?.kind !== "buildings") {
      fail("household meal has no placed home room")
      continue
    }
    const service = room.meal_service as { mode: "staggered"; routine_source: string } | undefined
    if (service?.mode === "staggered")
      for (const id of members) {
        const routine = documents.get(id)?.routine_source as { file?: string } | undefined
        if (!routine || routine.file !== service.routine_source) fail(`Staggered meal has no matching resident routine source: ${id}`)
      }
    if (!table || table.role !== "table") {
      fail("household meal has no dining surface")
      continue
    }
    if (!members.length || seats.length !== members.length || new Set(seats.map((s) => s.resident)).size !== seats.length || !members.every((id) => seats.some((s) => s.resident === id)))
      fail("household meal does not seat every member exactly once")
    if (new Set(seats.map((s) => s.chair)).size !== seats.length) fail("household meal shares a chair")
    const chairs: NonNullable<SettingDocument["furniture"]> = []
    for (const seat of seats) {
      const resident = documents.get(seat.resident),
        chair = room.furniture?.find((f) => f.symbol === seat.chair)
      if (resident?.kind !== "residents" || !members.includes(seat.resident) || !(room.occupants as string[] | undefined)?.includes(resident.title)) fail("diner does not belong to this home and room")
      if (!chair || chair.role !== "seat" || !table.seat_symbols?.includes(seat.chair)) fail("diner has no chair at the dining surface")
      else chairs.push(chair)
    }
    if (
      crowdedSeatCentres(
        chairs.map((chair) => chair.rect),
        room.grid.cell_m,
      )
    )
      fail("dining seat centres crowd the occupants")
  }
  return [...new Set(errors)]
}
