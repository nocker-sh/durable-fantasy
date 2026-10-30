import { getRoomWorkUseContext } from "#/scripts/lib/get-room-work-use-context"
import { getRoomWorkKitLayoutError } from "#/scripts/lib/get-room-work-kit-layout-error"
import type { RoomWorkUse } from "#/scripts/lib/room-work-use-types"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Slot } from "#/world/town/routine-types"

type Props = Readonly<{ room: SettingDocument; use: RoomWorkUse; documents: ReadonlyMap<string, SettingDocument>; routines: Readonly<Record<string, readonly Slot[]>> }>

/** Keep references, kit layout and completion gates distinct; handling, lighting and concurrent use remain separate design work. */
export function getRoomWorkUseError(props: Props): Error | null {
  const use = props.use
  const context = getRoomWorkUseContext(props)
  if (context instanceof Error) return context
  const resident = context.resident
  if (
    use.kit.owner !== use.resident ||
    [use.kit.proposed_box_maker, use.kit.proposed_needle_maker, ...(use.kit.box?.contents.flatMap((piece) => piece.makers) ?? [])].some((id) => props.documents.get(id)?.kind !== "residents")
  )
    return new Error("Work kit has invalid ownership or makers")
  if (use.routine_source.key !== resident.title || !Object.hasOwn(props.routines, resident.title) || !props.routines[resident.title]?.some((slot) => slot.doing === use.routine_source.doing))
    return new Error("Work use has no matching routine activity")
  const layoutError = getRoomWorkKitLayoutError({ room: props.room, use, context, documents: props.documents })
  if (layoutError) return layoutError
  const dependencies = [use.resident, use.storage_room, use.kit.proposed_box_maker, use.kit.proposed_needle_maker, ...(use.kit.box?.contents.flatMap((piece) => piece.makers) ?? [])]
  const declared = props.room.design_dependencies
  if (!Array.isArray(declared) || dependencies.some((id) => !declared.includes(id))) return new Error("Work use has missing design dependencies")
  if (props.room.design_gate === "通過" && use.status !== "designed") return new Error("Work use is still proposed")

  return null
}
