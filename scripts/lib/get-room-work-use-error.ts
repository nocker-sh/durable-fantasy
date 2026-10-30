import { getWorkKitBoxError } from "#/scripts/lib/get-work-kit-box-error"
import type { z } from "zod"
import type { roomWorkUseSchema } from "#/scripts/lib/room-work-use-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Slot } from "#/world/town/routine-types"

type Props = Readonly<{ room: SettingDocument; use: z.infer<typeof roomWorkUseSchema>; documents: ReadonlyMap<string, SettingDocument>; routines: Readonly<Record<string, readonly Slot[]>> }>

/** Validate references only; storage capacity, lighting and concurrent use remain separate design work. */
export function getRoomWorkUseError(props: Props): Error | null {
  const use = props.use
  const resident = props.documents.get(use.resident)
  if (props.room.kind !== "rooms" || resident?.kind !== "residents" || !Array.isArray(props.room.occupants) || !props.room.occupants.includes(resident.title))
    return new Error("Work use has no resident occupant")
  const building = props.documents.get(String(props.room.building))
  if (building?.kind !== "buildings" || !Array.isArray(building.rooms) || !building.rooms.includes(props.room.id)) return new Error("Work use has no containing building")
  const table = props.room.furniture?.find((piece) => piece.symbol === use.furniture)
  if (!table?.seat_symbols?.includes(use.seat_symbol) || !props.room.furniture?.some((piece) => piece.symbol === use.seat_symbol)) return new Error("Work use has no matching furniture and seat")
  const storageRoom = props.documents.get(use.storage_room)
  const storage = storageRoom?.furniture?.find((piece) => piece.symbol === use.storage_symbol)
  if (
    storageRoom?.kind !== "rooms" ||
    storageRoom.building !== props.room.building ||
    !building.rooms.includes(storageRoom.id) ||
    storage?.role !== "storage" ||
    !storage.compartments?.includes(use.kit.storage_compartment)
  )
    return new Error("Work use has no matching household storage compartment")
  if (storage.owner !== resident.title && storage.owner !== resident.household && !storage.owners?.includes(resident.title)) return new Error("Work kit storage belongs to another resident")
  if (
    use.kit.owner !== use.resident ||
    [use.kit.proposed_box_maker, use.kit.proposed_needle_maker, ...(use.kit.box?.contents.flatMap((piece) => piece.makers) ?? [])].some((id) => props.documents.get(id)?.kind !== "residents")
  )
    return new Error("Work kit has invalid ownership or makers")
  if (use.routine_source.key !== resident.title || !Object.hasOwn(props.routines, resident.title) || !props.routines[resident.title]?.some((slot) => slot.doing === use.routine_source.doing))
    return new Error("Work use has no matching routine activity")
  if (use.status === "designed" && !use.kit.box) return new Error("Work kit has no dimensioned box")
  if (use.kit.box) {
    const error = getWorkKitBoxError({ box: use.kit.box, owner: use.kit.owner, documents: props.documents })
    if (error) return error
  }
  const dependencies = [use.resident, use.storage_room, use.kit.proposed_box_maker, use.kit.proposed_needle_maker, ...(use.kit.box?.contents.flatMap((piece) => piece.makers) ?? [])]
  const declared = props.room.design_dependencies
  if (!Array.isArray(declared) || dependencies.some((id) => !declared.includes(id))) return new Error("Work use has missing design dependencies")
  if (props.room.design_gate === "通過" && use.status !== "designed") return new Error("Work use is still proposed")

  return null
}
