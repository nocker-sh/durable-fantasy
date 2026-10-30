import { z } from "zod"
import type { Road } from "#/world/maps/layout"
import { getWindmillYardSiteReview } from "#/scripts/lib/get-windmill-yard-site-review"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Rectangle } from "#/lib/engine/rectangle-subtraction"
import type { WindmillSiteReview, WindmillSiteCollection } from "#/scripts/lib/windmill-site-types"
const locationSchema = z.object({ map: z.string() })
type Props = Readonly<{ documents: Iterable<SettingDocument>; fieldsByMap: ReadonlyMap<string, readonly Rectangle[]>; roadsByMap?: ReadonlyMap<string, readonly Road[]>; metresPerTile: number }>

/** Resolve each site's fields from its own map, without rewriting the documents or suppressing invalid proposals. */
export function getWindmillYardSiteReviews(props: Props): WindmillSiteCollection {
  const reviews: WindmillSiteReview[] = [],
    errors: string[] = []
  for (const document of props.documents) {
    if (document.windmill_yard_site === undefined) continue
    const location = locationSchema.safeParse(document.site)
    const fields = location.success ? props.fieldsByMap.get(location.data.map) : null
    if (!fields) {
      errors.push(`${document.id}: Windmill site has no outdoor map`)
      continue
    }
    const review = getWindmillYardSiteReview({ document, fields, roads: location.success ? props.roadsByMap?.get(location.data.map) : undefined, metresPerTile: props.metresPerTile })
    if (review instanceof Error) errors.push(`${document.id}: ${review.message}`)
    else if (review) reviews.push(review)
  }
  return { reviews, errors }
}
