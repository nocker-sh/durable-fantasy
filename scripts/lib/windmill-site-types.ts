import type { getWindmillYardSiteReview } from "#/scripts/lib/get-windmill-yard-site-review"
import type { ReservedLand } from "#/scripts/lib/land-use"
export type WindmillSiteReview = Exclude<ReturnType<typeof getWindmillYardSiteReview>, Error | null>
export type WindmillSiteCollection = Readonly<{
  reviews: readonly WindmillSiteReview[]
  errors: readonly string[]
}>
export type WindmillSiteAllocation = Readonly<{
  reservations: ReadonlyMap<string, readonly ReservedLand[]>
  footprints: readonly WindmillSiteReview["footprint"][]
  errors: readonly string[]
}>
