import { clothDryingSchema } from "#/scripts/lib/cloth-drying-schema"
import { getClothDryingLayout } from "#/world/town/get-cloth-drying-layout"

/** The authored rack must have room for hanging cloth and drips, beyond its floor footprint. */
export function getClothDryingError(value: unknown, width: number, depth: number): Error | null {
  const parsed = clothDryingSchema.safeParse(value)
  if (!parsed.success) return new Error("Invalid cloth drying dimensions")
  const layout = getClothDryingLayout({ ...parsed.data, width, depth })

  if (layout instanceof Error) return layout

  return null
}
