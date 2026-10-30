import type { Cell, Interior } from "#/world/town/interiors"
import { interiorCellOf } from "#/world/town/interior-cell-of"

/** Where people stand round the tables (at the benches), two to a bench. */
export function seatsOf(it: Interior): Cell[] {
  return it.furniture
    .filter((f) => f.kind === "bench" || f.kind === "chair")
    .flatMap((f) => (f.kind === "bench" ? [interiorCellOf(f.x - 0.3, f.z), interiorCellOf(f.x + 0.3, f.z)] : [interiorCellOf(f.x, f.z)]))
}
