import type { z } from "zod"
import type { stockLockWaitingSchema } from "#/scripts/lib/stock-lock-waiting-schema"
import type { TownAnimalSpawn } from "#/world/town/animal-types"
import { getSheepBodyRadius } from "#/world/town/get-sheep-body-radius"
type Props = Readonly<{ waiting: z.infer<typeof stockLockWaitingSchema>; animals: readonly TownAnimalSpawn[]; origin: readonly [number, number]; metresPerTile: number }>
export type StockLockWaitingCircle = Readonly<{ animal: string; centre: readonly [number, number]; radius: number }>

/** Bind every native sheep once and derive its body from the actual spawn scale, never a radius chosen to make the placements fit. */
export function getStockLockWaitingCircles(props: Props): readonly StockLockWaitingCircle[] | Error {
  const assignments = props.waiting.assignments,
    animals = new Map(props.animals.map((animal) => [animal.id, animal]))
  if (![...props.origin, props.metresPerTile].every(Number.isFinite) || props.metresPerTile <= 0) return new Error("Invalid stock waiting frame")
  if (
    animals.size === 0 ||
    animals.size !== props.animals.length ||
    assignments.length !== animals.size ||
    new Set(assignments.map((assignment) => assignment.animal)).size !== animals.size ||
    props.animals.some((animal) => animal.kind !== "sheep")
  )
    return new Error("Stock waiting must assign every sheep exactly once")
  const circles: StockLockWaitingCircle[] = []
  for (const assignment of assignments) {
    const animal = animals.get(assignment.animal)
    if (!animal) return new Error("Stock waiting contains an unknown sheep")
    const radius = getSheepBodyRadius(animal.scale),
      centre: readonly [number, number] = [props.origin[0] + assignment.point_m[0] / props.metresPerTile, props.origin[1] + assignment.point_m[1] / props.metresPerTile]
    if (radius instanceof Error) return radius
    if (!centre.every(Number.isFinite)) return new Error("Unbounded stock waiting position")
    circles.push({ animal: animal.id, centre, radius })
  }

  return circles
}
