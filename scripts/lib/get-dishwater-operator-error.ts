import type { z } from "zod"
import type { dishwaterCaptureSchema } from "#/scripts/lib/dishwater-capture-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { getResidentProposalError } from "#/scripts/lib/get-resident-proposal-error"
import { residentProposalSchema } from "#/scripts/lib/resident-proposal-schema"
import { getProposedDayRoomError } from "#/scripts/lib/get-proposed-day-room-error"
type Props = Readonly<{ room: SettingDocument; capture: z.infer<typeof dishwaterCaptureSchema>; documents: ReadonlyMap<string, SettingDocument> }>

/** Each reserved batch belongs to an authored cleanup at home; the count does not establish a sufficient washing method. */
export function getDishwaterOperatorError(props: Props): Error | null {
  const operator = props.documents.get(props.capture.operator),
    proposal = residentProposalSchema.safeParse(operator?.resident_proposal)
  if (operator?.kind !== "residents" || !proposal.success || !proposal.data.day_plan) return new Error("Dishwater capture has no matching proposed workday")
  const dayError = getResidentProposalError({ resident: operator, documents: props.documents })
  if (dayError) return dayError
  const access = getProposedDayRoomError({ resident: operator, room: props.room, activity: "cleanup", documents: props.documents })
  if (access) return access
  const batches = proposal.data.day_plan.segments.filter(
    (segment) => segment.kind === "stay" && segment.activity === "cleanup" && segment.place.kind === "room" && segment.place.room === props.room.id,
  )
  if (batches.length !== props.capture.daily_batches) return new Error("Dishwater reservation does not match the workday cleanups")
  for (const symbol of [props.capture.fresh_symbol, props.capture.wash_symbol, props.capture.dry_symbol, props.capture.effluent_symbol]) {
    const piece = props.room.furniture?.find((piece) => piece.symbol === symbol)
    if (piece?.owner !== operator.title || !piece.maintainers?.includes(operator.id)) return new Error("Dishwater equipment has no matching owner and maintainer")
  }

  return null
}
