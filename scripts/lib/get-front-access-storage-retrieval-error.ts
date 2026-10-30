import { cuboidTranslationHits } from "#/lib/engine/cuboid-translation-hits"
import type { getSlidingCabinetPlan } from "#/world/town/get-sliding-cabinet-plan"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { SlidingCabinetSpec } from "#/world/town/sliding-cabinet-types"
type Leaves = Readonly<Record<"north" | "south", readonly Cuboid[]>>
type Plan = Pick<Exclude<ReturnType<typeof getSlidingCabinetPlan>, Error>, "travel" | "cavity"> & Readonly<{ fixed: readonly Cuboid[]; closed: Leaves; open: Leaves }>
type Props = Readonly<{ spec: SlidingCabinetSpec; plan: Plan; contents: readonly Cuboid[]; clearance: number }>

/** Each unchanged parcel clears one real opening and the lift and entire straight withdrawal; hands and load support are separate requirements. */
export function getFrontAccessStorageRetrievalError(props: Props): Error | null {
  const plan = props.plan,
    gap = props.clearance
  if (!Number.isFinite(gap) || gap < 0) return new Error("Invalid front-access retrieval clearance")

  for (const piece of props.contents) {
    const sides = {
      north: piece.z0 >= plan.cavity.z0 + gap - 1e-12 && piece.z1 <= plan.cavity.z0 + plan.travel.north - gap + 1e-12,
      south: piece.z0 >= plan.cavity.z1 - plan.travel.south + gap - 1e-12 && piece.z1 <= plan.cavity.z1 - gap + 1e-12,
    }
    const panels = { value: [...plan.open.north, ...plan.closed.south] }
    if (!sides.north) {
      if (!sides.south) return new Error("Stored parcel cannot pass through either sliding opening")
      panels.value = [...plan.closed.north, ...plan.open.south]
    }
    const obstacles = [...plan.fixed, ...panels.value, ...props.contents.filter((other) => other !== piece)]
    const distance = props.spec.bounds.x0 - piece.x1 - gap,
      lift = props.spec.guide + gap
    if (
      obstacles.some(
        (obstacle) =>
          cuboidTranslationHits({ relative: piece, from: [0, 0, 0], to: [0, lift, 0], obstacle: obstacle, tolerance: 1e-12 }) ||
          cuboidTranslationHits({ relative: piece, from: [0, lift, 0], to: [distance, lift, 0], obstacle: obstacle, tolerance: 1e-12 }),
      )
    )
      return new Error("Stored parcel withdrawal intersects a board or another parcel")
  }

  return null
}
