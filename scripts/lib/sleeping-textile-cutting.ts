import type { getBlanketCuttingReview } from "#/scripts/lib/get-blanket-cutting-review"
import type { getPillowCoverCuttingReview } from "#/scripts/lib/get-pillow-cover-cutting-review"
export type SleepingTextileCutting = Exclude<ReturnType<typeof getBlanketCuttingReview> | ReturnType<typeof getPillowCoverCuttingReview>, Error>
