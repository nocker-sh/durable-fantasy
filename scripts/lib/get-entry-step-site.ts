import { entryStepSiteSchema } from "#/scripts/lib/entry-step-site-schema"
import { getEntryStepDoorPose } from "#/scripts/lib/get-entry-step-door-pose"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { EntrySteps } from "#/scripts/lib/entry-steps-types"
type Props = Readonly<{ building: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; steps: EntrySteps; metres: number }>

/** Only a ground-floor doorway belonging to the authored building may anchor an exterior stair. */
export function getEntryStepSite(props: Props) {
  const parsed = entryStepSiteSchema.safeParse({ building: props.building, room: props.documents.get(props.steps.room), steps: props.steps })
  if (!parsed.success) return null
  const site = parsed.data
  if (!site.building.rooms.includes(site.room.id) || site.room.building !== site.building.id) return null
  const door = site.room.connections.find((connection) => connection.target === site.building.map && connection.door?.[0] === site.steps.door[0] && connection.door?.[1] === site.steps.door[1])
  if (!door) return null
  const pose = getEntryStepDoorPose(site, door.width_cells ?? 1, props.metres)
  if (!pose || ![...pose.point, ...pose.outward, ...pose.bounds, pose.width_m].every(Number.isFinite)) return null
  return { pose, steps: site.steps, elevation: site.building.foundation.floor_elevation_m, metres: props.metres }
}
